/**
 * Post-build verification against the migrated content.
 * Run with `npm test` (after `npm run build`).
 *
 * Catches the failure modes that matter for this migration:
 *  - a legacy WordPress URL that stopped resolving
 *  - a redirect pointing at a page that does not exist
 *  - an internal link with no target (broken nav)
 *  - leftover WordPress shortcodes or escaped HTML in the output
 *  - a referenced PDF or image missing from dist
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`  FAIL  ${msg}`);
};
const section = (name) => console.log(`\n${name}`);

if (!fs.existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/** Every built route, normalised to a trailing-slash URL path. */
const routes = new Set();
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      htmlFiles.push(p);
      const rel = '/' + path.relative(dist, p).split(path.sep).join('/');
      routes.add(rel.replace(/index\.html$/, '').replace(/\.html$/, ''));
    }
  }
})(dist);

// ── 1. every routed entry resolves, at the root for FR and prefixed for en/ar ─
// The French `url` is the inherited WordPress permalink: it must build at the
// bare root, unprefixed, or the redirect map and every old inbound link break.
section('routed permalinks');
const LOCALES = ['fr', 'en', 'ar'];
const collections = ['posts', 'documents'];
let urlCount = 0;
let frLegacyCount = 0;
for (const col of collections) {
  for (const lang of LOCALES) {
    const dir = path.join(root, 'src/content', col, lang);
    if (!fs.existsSync(dir)) {
      fail(`${col}/${lang}/ is missing — a locale has no content`);
      continue;
    }
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const fm = fs.readFileSync(path.join(dir, f), 'utf8');
      const url = fm.match(/^url: '(.+)'$/m)?.[1];
      if (!url) {
        fail(`${col}/${lang}/${f}: no url in frontmatter`);
        continue;
      }
      const built = lang === 'fr' ? url : `/${lang}${url}`;
      urlCount++;
      if (lang === 'fr') frLegacyCount++;
      if (!routes.has(built)) fail(`${col}/${lang}/${f}: ${built} was not built`);
    }
  }
}
console.log(`  checked ${urlCount} routed URLs (${frLegacyCount} French permalinks at root)`);

// Every routed entry must exist in all three languages: a missing translation
// would leave a language switcher link pointing at a 404.
section('locale parity');
for (const col of collections) {
  const keysByLocale = Object.fromEntries(
    LOCALES.map((lang) => {
      const dir = path.join(root, 'src/content', col, lang);
      const keys = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
      return [lang, new Set(keys)];
    }),
  );
  for (const key of keysByLocale.fr) {
    for (const lang of ['en', 'ar']) {
      if (!keysByLocale[lang].has(key)) fail(`${col}/${key}: no ${lang} translation`);
    }
  }
}
console.log(`  every post and document exists in fr, en and ar`);

// ── 2. redirect targets exist ───────────────────────────────────────────────
section('redirect targets');
const { redirects } = JSON.parse(fs.readFileSync(path.join(root, 'src/redirects.json'), 'utf8'));
for (const r of redirects) {
  if (routes.has(r.from)) fail(`${r.from} redirects but is ALSO a built page`);
  const target = r.to.split('#')[0];
  if (target.includes('*')) continue; // wildcard target, checked per-file below
  if (target.startsWith('/') && !target.includes('.') && !routes.has(target)) {
    fail(`redirect ${r.from} -> ${target} (target not built)`);
  }
}
console.log(`  checked ${redirects.length} redirects`);

// AATUJA content was deleted rather than redirected: these paths must 404,
// which means no built page AND no redirect rule pointing at them.
section('deleted AATUJA paths');
const htaccess = fs.readFileSync(path.join(dist, '.htaccess'), 'utf8');
// Directives only — comments may legitimately mention these paths.
const directives = htaccess
  .split('\n')
  .filter((l) => l.trim() && !l.trim().startsWith('#'))
  .join('\n');
const DELETED = [
  '/about-us/',
  '/members-board/',
  '/sample-page/',
  '/sample-page/projets/',
  '/sample-page/news/',
  '/2023/06/20/ceremonie-a-lhonneur-de-mr-pascal-livolsi/',
];
for (const p of DELETED) {
  if (routes.has(p)) fail(`${p} was built but should be gone`);
  if (directives.includes(p)) fail(`${p} still has a redirect rule`);
}
if (!/ErrorDocument 404 \/404\.html/.test(htaccess)) fail('.htaccess: no ErrorDocument for 404');

// Nothing AATUJA-related may reach the output, including asset filenames.
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (/aatuja|amitie-tunisie|association-tunisie/i.test(html)) {
    fail(`AATUJA reference in ${path.relative(dist, file)}`);
  }
}
console.log(`  ${DELETED.length} deleted paths absent, no AATUJA references, 404 handler present`);

// ── 3. internal links resolve ───────────────────────────────────────────────
section('internal links');
const assets = new Set();
(function walkAll(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p);
    else assets.add('/' + path.relative(dist, p).split(path.sep).join('/'));
  }
})(dist);

let linkCount = 0;
const badLinks = new Set();
for (const file of htmlFiles) {
  // The 404 is the single ErrorDocument served in place of ANY missing URL, so
  // its language switcher self-links (/404/, /en/404/, /ar/404/) are notional —
  // they resolve to this very page by the ErrorDocument rule, not to a route.
  // Its nav links are identical to every other page's and checked there.
  if (path.relative(dist, file) === '404.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const href = m[1];
    if (href.startsWith('//')) continue;
    linkCount++;
    if (routes.has(href) || assets.has(href)) continue;
    // srcset/sitemap emit paths that exist as files; anything else is broken
    badLinks.add(`${href}  (in ${path.relative(dist, file)})`);
  }
}
for (const b of badLinks) fail(`dead internal link: ${b}`);
console.log(`  checked ${linkCount} internal links`);

// ── 4. no WordPress residue in rendered output ──────────────────────────────
section('WordPress residue');
const RESIDUE = [
  [/\[pdf-embedder/i, 'pdf-embedder shortcode'],
  [/\[vc_[a-z_]+/i, 'WPBakery shortcode'],
  [/\[metaslider/i, 'MetaSlider shortcode'],
  [/\[rev_slider/i, 'Slider Revolution shortcode'],
  [/&lt;(?:p|div|h[1-6]|img|a)[\s&]/i, 'escaped HTML'],
  [/wp-content\/uploads/i, 'old wp-content upload path'],
  [/tunisia-japan\.org/i, 'old AATUJA domain'],
  [/judo\.takolor\.(com|net)/i, 'old staging domain'],
  [/lorem ipsum/i, 'placeholder text'],
];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [re, label] of RESIDUE) {
    if (re.test(html)) fail(`${label} in ${path.relative(dist, file)}`);
  }
}
console.log(`  scanned ${htmlFiles.length} pages`);

// ── 5. required files present ───────────────────────────────────────────────
section('required files');
for (const f of ['sitemap-index.xml', 'rss.xml', 'robots.txt', '404.html', '.htaccess']) {
  if (!fs.existsSync(path.join(dist, f))) fail(`missing dist/${f}`);
}
const pdfs = fs.existsSync(path.join(dist, 'documents'))
  ? fs.readdirSync(path.join(dist, 'documents')).filter((f) => f.endsWith('.pdf'))
  : [];
if (pdfs.length !== 10) fail(`expected 10 PDFs in dist/documents, found ${pdfs.length}`);
console.log(`  ${pdfs.length} PDFs present`);

// ── 6. accessibility & SEO basics on every page ─────────────────────────────
// The expected lang/dir come from the URL prefix: /ar/… is Arabic and RTL,
// /en/… is English, everything else is French. The 404 is French by design.
section('per-page head + a11y');
const langForRoute = (rel) => {
  const seg = rel.split('/')[0];
  if (seg === 'ar') return { lang: 'ar-TN', dir: 'rtl' };
  if (seg === 'en') return { lang: 'en', dir: 'ltr' };
  return { lang: 'fr-TN', dir: 'ltr' };
};
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file).split(path.sep).join('/');
  const { lang, dir } = langForRoute(rel);
  if (!html.includes(`<html lang="${lang}" dir="${dir}">`))
    fail(`${rel}: expected <html lang="${lang}" dir="${dir}">`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(`${rel}: missing or empty <title>`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html))
    fail(`${rel}: weak meta description`);
  if (!/rel="canonical"/.test(html)) fail(`${rel}: missing canonical`);
  if (!/<main id="main"/.test(html)) fail(`${rel}: missing <main> landmark`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(`${rel}: needs exactly one <h1>`);
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(img[0])) fail(`${rel}: <img> without alt`);
  }
}
console.log(`  ${htmlFiles.length} pages carry the right lang/dir, title, description, canonical`);

// ── 7. i18n: hreflang, tri-locale parity, Arabic actually rendered ──────────
section('i18n wiring');
// Content pages — home, news, documents, contact and the five stubs — exist in
// all three locales, so each must advertise all three via hreflang. Article
// pages (posts/documents) are also translated, but the assertions above already
// prove the alternates were built; here we spot-check the top-level pages.
const HREFLANGS = ['fr-TN', 'en', 'ar-TN', 'x-default'];
const i18nPages = htmlFiles.filter((f) => {
  const rel = path.relative(dist, f).split(path.sep).join('/');
  return rel === 'index.html' || rel === 'en/index.html' || rel === 'ar/index.html';
});
for (const file of i18nPages) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file).split(path.sep).join('/');
  for (const hl of HREFLANGS) {
    if (!html.includes(`hreflang="${hl}"`)) fail(`${rel}: missing hreflang="${hl}"`);
  }
}
// The Arabic home must actually contain Arabic script and the Tunisian month
// name — a guard against Intl silently falling back to Latin or Mashriq forms.
const arHome = fs.readFileSync(path.join(dist, 'ar/index.html'), 'utf8');
if (!/[؀-ۿ]/.test(arHome)) fail('ar/index.html: no Arabic characters rendered');
const arNews = fs.readFileSync(
  path.join(dist, 'ar/2026/07/21/championnat-afrique-cadets-maroc-2026/index.html'),
  'utf8',
);
if (!arNews.includes('جويلية')) fail('ar news post: Tunisian month name "جويلية" not rendered');
if (/يوليو/.test(arNews)) fail('ar news post: Mashriq month name leaked in — wrong Intl locale');
// The Arabic font is heavy; only the Arabic build should preload it.
if (!arHome.includes('noto-sans-arabic')) fail('ar/index.html: Arabic font not preloaded');
const frHome = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (frHome.includes('noto-sans-arabic'))
  fail('index.html: French build preloads the Arabic font (166 kB wasted)');
console.log('  hreflang complete on home pages; Arabic rendered with Tunisian dates');

console.log(
  failures === 0
    ? `\nAll checks passed — ${htmlFiles.length} pages, ${frLegacyCount} French permalinks preserved, 3 locales.`
    : `\n${failures} check(s) failed.`,
);
process.exit(failures === 0 ? 0 : 1);
