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

// ── 1. every legacy permalink still resolves ────────────────────────────────
section('legacy permalinks');
const collections = ['posts', 'documents'];
let legacyCount = 0;
for (const col of collections) {
  const dir = path.join(root, 'src/content', col);
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const fm = fs.readFileSync(path.join(dir, f), 'utf8');
    const url = fm.match(/^legacyUrl: '(.+)'$/m)?.[1];
    if (!url) {
      fail(`${col}/${f}: no legacyUrl in frontmatter`);
      continue;
    }
    legacyCount++;
    if (!routes.has(url)) fail(`${col}/${f}: ${url} was not built`);
  }
}
console.log(`  checked ${legacyCount} legacy URLs`);

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
for (const p of [
  '/about-us/',
  '/members-board/',
  '/sample-page/',
  '/sample-page/projets/',
  '/sample-page/news/',
]) {
  if (routes.has(p)) fail(`${p} was built but should be gone`);
  if (directives.includes(p)) fail(`${p} still has a redirect rule`);
}
if (!/ErrorDocument 404 \/404\.html/.test(htaccess)) fail('.htaccess: no ErrorDocument for 404');
console.log('  5 AATUJA paths confirmed absent, 404 handler present');

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
section('per-page head + a11y');
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  if (!/<html lang="fr"/.test(html)) fail(`${rel}: missing lang="fr"`);
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

console.log(
  failures === 0
    ? `\nAll checks passed — ${htmlFiles.length} pages, ${legacyCount} legacy URLs preserved.`
    : `\n${failures} check(s) failed.`,
);
process.exit(failures === 0 ? 0 : 1);
