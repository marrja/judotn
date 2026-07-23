# judo.tn — Fédération Tunisienne de Judo

Static site built with [Astro](https://astro.build). Rebuilt from a WordPress
installation (The7 + Elementor); see [`docs/phase1-audit.md`](docs/phase1-audit.md)
for the audit of the old site and [`docs/migration.md`](docs/migration.md) for what
changed and what was dropped.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                            |
| `npm run build`   | Type-check, generate redirect files, build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally                       |
| `npm test`        | Verify the build (run after `npm run build`)          |
| `npm run lint`    | ESLint + Prettier check                               |
| `npm run format`  | Rewrite files with Prettier                           |

`npm run build` and `npm run lint` must both pass before deploying.

---

## Languages (FR / EN / AR)

The site is trilingual, each language under its own prefix: **French** at
`/fr/`, **English** at `/en/`, **Arabic** at `/ar/` (right-to-left).

The bare root `/` is a **language gate**: it detects the visitor's browser
language and redirects to `/fr/`, `/en/` or `/ar/`, falling back to **English**
when the browser asks for none of the three. It also shows a manual chooser for
visitors without JavaScript.

Because French used to live at the root, every old un-prefixed URL
(`/2024/06/25/slug/`, `/documents/`, `/la-federation/`, …) now **301-redirects**
to its `/fr/` counterpart — generated automatically from the current French
content, so no inbound link or bookmark breaks. `npm test` fails if one is
missing.

Two rules make the whole thing work:

- **Content is split one folder per language:** `src/content/posts/fr/`,
  `…/en/`, `…/ar/`, and the same for `documents/` and `pages/`.
- **The filename is the translation link.** The three files that share a name —
  `posts/fr/x.md`, `posts/en/x.md`, `posts/ar/x.md` — are the same item in three
  languages, and that is what wires up the language switcher. So **an item must
  exist in all three languages with the same filename.** `npm test` fails if a
  translation is missing.

Interface text (menus, buttons, labels, dates) is **not** in the Markdown — it
lives in [`src/i18n/ui.ts`](src/i18n/ui.ts), one entry per language. French is
the source of truth there: if you add a key and forget its English or Arabic
value, `npm run build` fails to compile.

---

## Editing content

**All content is Markdown.** You do not need to touch any code to add or change
a news item, an announcement, or a document — but remember you are adding it in
**three languages**.

### Add a news item or announcement

Create the file **three times**, once in each of `src/content/posts/fr/`,
`src/content/posts/en/` and `src/content/posts/ar/`, using the **same filename**
each time (name it after the French URL slug):

```markdown
---
title: 'Titre de l’actualité'
date: 2026-07-22T10:00:00Z
category: 'actualites' # or 'annonces'
excerpt: 'Résumé court pour Google et les réseaux sociaux.' # optional
cover: '../../../assets/posts/ma-photo.jpg' # optional
coverAlt: 'Description de la photo pour les lecteurs d’écran'
tags: ['Judo'] # optional
url: '/2026/07/22/titre-de-lactualite/'
---

Le corps de l’article, en Markdown. Il peut être vide.
```

`excerpt` becomes the `<meta description>` and the social/JSON-LD summary. Leave
it out and the first paragraph of the body is used instead — only set it to
override that. `cover` is also used as the `og:image`/article image for sharing.

Only `title`, `excerpt`, `coverAlt`, `tags` and the body change between languages — `date`,
`cover` and **`url` stay identical in all three files** (the `/fr/`, `/en/` and
`/ar/` prefixes are added automatically). The Arabic file is written in Arabic,
and the page turns right-to-left on its own.

If the body links to another page on the site, **prefix the link with the same
language** — `[Documents](/fr/documents/)` in a French file, `/en/documents/` in
an English one. An un-prefixed `/documents/` still works (it 301s to `/fr/`) but
costs a redirect hop.

Put the image in `src/assets/posts/` first (once — it's shared). Astro converts
it to WebP and generates the responsive sizes automatically; use the original,
don't resize it yourself. Note the cover path is `../../../assets/…` — three
levels up, because the file now sits one folder deeper under its language.

`url` is the page's address and **must** match the date and slug:
`/YYYY/MM/DD/<slug>/`. It preserves the scheme WordPress used; new posts follow
the same pattern. `npm test` fails if a `url` doesn't resolve or a translation
is missing.

### Add a document (PDF)

1. Put the PDF in `public/documents/` (once — the PDF itself is not translated).
2. Create the record **three times**, in `src/content/documents/{fr,en,ar}/`,
   same filename, translating only the `title`:

```markdown
---
title: 'Nom du document'
date: 2026-07-22T10:00:00Z
pdf: '/documents/nom-du-fichier.pdf'
pdfBytes: 1234567
url: '/2026/07/22/nom-du-document/'
---
```

`pdfBytes` is the file size in bytes (`ls -l` or the file properties dialog). It
renders as the "PDF · 1,2 Mo" label so people know what they're downloading
before they tap it on mobile data. The documents are French PDFs, so the English
and Arabic pages show a "published in French only" note automatically.

### Edit a section page

The five section pages — La Fédération, Direction Technique, Activités,
Techniques, Espace Clubs — live in `src/content/pages/{fr,en,ar}/` as Markdown.
They currently contain **placeholder text inside blockquotes**, because these
sections had no content in WordPress (the menu items pointed at `#`). Replace the
blockquote in each language and write normally.

Set `draft: true` in the frontmatter to remove a page from the build.

### Change interface text (menus, buttons, labels)

[`src/i18n/ui.ts`](src/i18n/ui.ts) — one object per language, French first.
Change a string there and it updates everywhere it is used, in that language.

### Change the site URL or contact details

Site-wide non-text values are in [`src/site.js`](src/site.js). **The contact
details there are placeholders** — the old `/contact/` page was empty and the
database held no address, phone or public email. Fill in a `value` and it updates
on `/contact/` and in the footer at once, in all three languages.

### Change the navigation

[`src/navigation.ts`](src/navigation.ts) builds each menu per language, taking
its labels from `src/i18n/ui.ts`. External links get `external: true`, which adds
`target="_blank"`, the right `rel`, and a visual marker.

---

## Project structure

```
src/
  assets/posts/        images for posts (optimised at build time, shared across languages)
  components/          Header, Footer, Seo, PostCard, DocumentList, PageHeader, LanguageSwitcher
  content/
    posts/{fr,en,ar}/       news + announcements  (Markdown, one folder per language)
    documents/{fr,en,ar}/   PDF records           (Markdown)
    pages/{fr,en,ar}/       section pages         (Markdown)
  i18n/
    ui.ts              every interface string, in all three languages (French is the source of truth)
    index.ts           locale helpers: URLs, dates, file sizes
    detect.ts          browser-language pick for the root gate (also runs client-side)
  layouts/BaseLayout.astro
  lib/content.ts       locale-aware access to the collections
  pages/               routes (see below)
  styles/global.css    ALL design tokens live here + the right-to-left rules
  content.config.ts    zod schemas for the three collections
  navigation.ts        menus (built per language from i18n/ui.ts)
  redirects.json       old URL -> new URL map (generates public/.htaccess)
  site.js              site URL + contact details
public/
  .htaccess            GENERATED — Hostinger config, do not edit
  documents/           the PDFs themselves
  fonts/               self-hosted variable fonts (incl. Noto Sans Arabic)
scripts/
  gen-redirects.mjs    writes public/.htaccess from redirects.json
  verify-build.mjs     the build-verification part of `npm test`
  test-i18n.mjs        unit tests for the locale helpers
```

### Routes

The localized routes live under `pages/[lang]/`, where `[lang]` is exactly one
of `fr` / `en` / `ar` — one source file produces all three language versions.
The bare root `/` is a separate page: the browser-language gate.

| File                                             | Generates                                                       |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `pages/index.astro`                              | `/` — browser-language gate, redirects to `/fr`, `/en` or `/ar` |
| `pages/[lang]/index.astro`                       | `/fr/`, `/en/`, `/ar/`                                          |
| `pages/[lang]/[year]/[month]/[day]/[slug].astro` | the posts and documents, at their WordPress URLs, prefixed      |
| `pages/[lang]/[page].astro`                      | the 5 section pages                                             |
| `pages/[lang]/actualites/index.astro`            | `/{lang}/actualites/`                                           |
| `pages/[lang]/documents/index.astro`             | `/{lang}/documents/`                                            |
| `pages/[lang]/contact.astro`                     | `/{lang}/contact/`                                              |
| `pages/[lang]/rss.xml.ts`                        | `/{lang}/rss.xml` (one feed per language)                       |
| `pages/404.astro`                                | `/404` — one English page (Apache serves one ErrorDocument)     |
| `pages/robots.txt.ts`                            | `/robots.txt`                                                   |

`sitemap-index.xml` comes from `@astrojs/sitemap`, configured to emit `hreflang`
alternates for all three languages (the root gate is excluded). The un-prefixed
→ `/fr/` redirects are generated into `public/.htaccess` by `gen-redirects.mjs`.

---

## Styling

Plain scoped CSS — no framework. Every colour, space and font size is a CSS
custom property declared once in [`src/styles/global.css`](src/styles/global.css).
Components reference tokens (`var(--accent-text)`), never literal values, so
retheming the site means editing one block.

```css
--bg: #0e0e10; /* page ground */
--accent: #e0243f; /* fills and large display type */
--accent-text: #ff3b52; /* links and body-size text — clears WCAG AA on --bg */
```

The two accent tokens exist because the original brand crimson is not legible at
body size on a near-black ground. Use `--accent-text` for anything you read,
`--accent` for anything you look at.

Fonts are **Manrope** and **Platypi** for Latin, and **Noto Sans Arabic** for
Arabic — all SIL OFL, all self-hosted from `public/fonts/` as variable fonts. No
CDN, no Google Fonts, nothing to break. The Arabic face is `unicode-range`-scoped,
so French and English pages never download it.

### Right-to-left

Arabic pages render with `dir="rtl"` on `<html>`, set automatically from the URL.
The layout follows because the CSS uses **logical properties**
(`margin-inline-start`, `padding-inline-end`, `inset-inline-start`) rather than
`left`/`right`, so it mirrors on its own. If you write new CSS, keep to logical
properties and it will keep working in both directions.

One thing that is **not** automatic and is easy to get wrong: the design uses
`letter-spacing` + `text-transform: uppercase` for eyebrows, labels and buttons.
Arabic is cursive and has no uppercase, so that treatment breaks it — there is a
`[dir='rtl']` block at the end of `global.css` that strips it. If you add a new
spaced-uppercase element, add its selector there too.

---

## Deploying to Hostinger

The site is fully static. Production domain is **judo.tn** (set in
`src/site.js`).

```bash
npm ci
npm run build
npm test          # optional but recommended
```

Then upload **the contents of `dist/`** into `public_html` — the files
themselves, not the `dist` folder. Use hPanel's File Manager, FTP, or SSH:

```bash
rsync -av --delete dist/ user@judo.tn:~/public_html/
```

`--delete` removes files that are no longer part of the build. Drop it if
anything else lives in `public_html`.

### About `.htaccess`

`public/.htaccess` is **generated on every build** from `src/redirects.json` —
edit that file, never the output. Astro copies it into `dist/`, so it uploads
with everything else. Hostinger runs LiteSpeed, which reads Apache `.htaccess`.

It handles:

- **404s** — `ErrorDocument 404 /404.html`, so the custom 404 page is served
- **HTTPS + www** — forces `https://` and strips `www.`, using `%{HTTP_HOST}`
  rather than a hardcoded domain so it also works on Hostinger's temporary
  preview subdomain during setup
- **Old WordPress URLs** — the six redirects listed in `src/redirects.json`
- **Compression and caching** — `/_astro/*` is content-hashed and served
  `immutable` for a year; HTML and unhashed files (the logo, favicon) must
  revalidate, so replacing them takes effect immediately

**Make sure hidden files are visible** in the File Manager, or `.htaccess` will
be silently skipped on upload.

### After the first deploy

Check that `https://judo.tn/2024/06/25/kendo/` loads — that URL existed on the
WordPress site and must still work. If it 404s, `.htaccess` did not upload.

---

## Source material

`archive/` holds the original WordPress `wp-content` and SQL dump. It is
**read-only reference**, gitignored, and not part of the build. Nothing in
`src/` reads from it at build time — the migration was a one-off.
