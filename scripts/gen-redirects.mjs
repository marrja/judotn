/**
 * Writes public/.htaccess from src/redirects.json PLUS an auto-generated block
 * that 301s every un-prefixed French path to its /fr/ equivalent.
 *
 * The site moved from French-at-root to /fr/, /en/, /ar/. Every URL that
 * worked before the move (a WordPress permalink, a section page, an index) was
 * a bare French path and must keep resolving, so those redirects are generated
 * from the current French content set rather than hand-listed — which also
 * means deleted content (it is no longer in the set) correctly 404s instead of
 * redirecting to a page that does not exist.
 *
 * Hostinger shared hosting runs LiteSpeed, which reads Apache .htaccess files.
 * Astro copies public/ into dist/ verbatim, so the file ships with the build and
 * lands next to index.html in public_html.
 *
 * Runs automatically on `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { redirects } = JSON.parse(fs.readFileSync(path.join(root, 'src/redirects.json'), 'utf8'));

const escapeRe = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/**
 * Every bare French path that existed before the move to /fr/, read from the
 * current content so deleted entries are absent. `/` is excluded on purpose —
 * it is the language gate, not a redirect.
 */
function localeMoveRules() {
  const frUrl = (collection) => {
    const dir = path.join(root, 'src/content', collection, 'fr');
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8').match(/^url: '(.+)'$/m)?.[1])
      .filter(Boolean);
  };

  const sectionPages = fs
    .readdirSync(path.join(root, 'src/content/pages/fr'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `/${f.replace(/\.md$/, '')}/`);

  // Standalone routes with no content file behind them.
  const fixed = ['/actualites/', '/documents/', '/contact/', '/rss.xml'];

  const paths = [...frUrl('posts'), ...frUrl('documents'), ...sectionPages, ...fixed];
  return paths.map((p) => ({ from: p, to: `/fr${p}` }));
}

const moves = localeMoveRules();

/**
 * `/a/b/*.pdf` -> `^/a/b/(.+)\.pdf$`, and the target's `*` becomes `$1`.
 * Anchored on both ends so `Redirect`'s prefix matching can't over-match.
 */
function rule({ from, to }) {
  if (from.includes('*')) {
    const [head, tail] = from.split('*');
    const pattern = `^${escapeRe(head)}(.+)${escapeRe(tail)}$`;
    return `RedirectMatch 301 ${pattern} ${to.replace('*', '$1')}`;
  }
  // Match with or without the trailing slash.
  const bare = from.replace(/\/$/, '');
  return `RedirectMatch 301 ^${escapeRe(bare)}/?$ ${to}`;
}

const htaccess = `# Generated from src/redirects.json — do not edit by hand.
# Hostinger / LiteSpeed (Apache-compatible).

Options -Indexes
DirectoryIndex index.html

# Serve the custom 404 page for anything that does not exist.
# Deleted AATUJA pages (/about-us/, /members-board/, /sample-page/*) land here
# by design — they are gone, not moved.
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Force HTTPS. %{HTTP_HOST} rather than a literal domain so this also works on
  # Hostinger's temporary preview subdomain; the X-Forwarded-Proto check avoids
  # a redirect loop when TLS is terminated upstream.
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

  # Drop the www subdomain.
  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]
</IfModule>

# ── Redirects from the old WordPress site ─────────────────────────────
${redirects.map(rule).join('\n')}

# ── French moved from the root to /fr/ ────────────────────────────────
# Every URL that used to serve French content at the root now 301s to its
# /fr/ counterpart, so no inbound link or bookmark breaks. Generated from the
# current French content — deleted pages are absent and 404 as intended.
${moves.map(rule).join('\n')}

# ── Compression ───────────────────────────────────────────────────────
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml \\
    application/javascript application/json application/xml image/svg+xml
</IfModule>

# ── Caching ───────────────────────────────────────────────────────────
# mod_headers only, so nothing fights mod_expires over Cache-Control.
<IfModule mod_headers.c>
  # Only /_astro/ is content-hashed, so only it may be immutable. Scoped by
  # request path: <FilesMatch> tests the filename and would wrongly catch
  # /logo-judo.png, freezing a replaced logo in caches for a year.
  SetEnvIf Request_URI "^/_astro/" FINGERPRINTED
  Header set Cache-Control "public, max-age=31536000, immutable" env=FINGERPRINTED

  <FilesMatch "\\.woff2$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <FilesMatch "\\.pdf$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  # HTML and anything unhashed (logo, favicon) must revalidate so edits appear.
  <FilesMatch "\\.(html|xml|txt|png|svg)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>

  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  # HSTS: browsers ignore it over plain HTTP, and the rewrite above forces HTTPS,
  # so this only ever takes effect on the secure origin. No 'preload' — that is a
  # one-way commitment that needs an explicit hstspreload.org submission.
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
`;

fs.writeFileSync(path.join(root, 'public/.htaccess'), htaccess);
console.log(
  `redirects: wrote ${redirects.length} hand + ${moves.length} language-move rules to public/.htaccess`,
);
