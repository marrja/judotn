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

## Editing content

**All content is Markdown.** You do not need to touch any code to add or change
a news item, an announcement, or a document.

### Add a news item or announcement

Create a file in `src/content/posts/`, named after the URL slug you want:

```markdown
---
title: 'Titre de l’actualité'
date: 2026-07-22T10:00:00Z
category: 'actualites' # or 'annonces'
cover: '../../assets/posts/ma-photo.jpg' # optional
coverAlt: 'Description de la photo pour les lecteurs d’écran'
tags: ['Judo'] # optional
legacySlug: 'titre-de-lactualite'
legacyUrl: '/2026/07/22/titre-de-lactualite/'
---

Le corps de l’article, en Markdown. Il peut être vide.
```

Put the image in `src/assets/posts/` first. Astro converts it to WebP and
generates the responsive sizes automatically — use the original, don't resize it
yourself.

`legacyUrl` is the page's address and **must** match the date and slug:
`/YYYY/MM/DD/<legacySlug>/`. It is named "legacy" because it preserves the URL
scheme WordPress used; new posts follow the same pattern so nothing is
inconsistent. `npm test` fails if a `legacyUrl` doesn't resolve.

### Add a document (PDF)

1. Put the PDF in `public/documents/`.
2. Create a file in `src/content/documents/`:

```markdown
---
title: 'Nom du document'
date: 2026-07-22T10:00:00Z
pdf: '/documents/nom-du-fichier.pdf'
pdfBytes: 1234567
legacySlug: 'nom-du-document'
legacyUrl: '/2026/07/22/nom-du-document/'
---
```

`pdfBytes` is the file size in bytes (`ls -l` or the file properties dialog). It
renders as the "PDF · 1,2 Mo" label so people know what they're downloading
before they tap it on mobile data.

### Edit a section page

The five section pages — La Fédération, Direction Technique, Activités,
Techniques, Espace Clubs — live in `src/content/pages/` as Markdown. They
currently contain **placeholder text inside blockquotes**, because these sections
had no content in WordPress (the menu items pointed at `#`). Replace the
blockquote and write normally.

Set `draft: true` in the frontmatter to remove a page from the build.

### Change the site title, description or contact details

Everything site-wide is in [`src/site.js`](src/site.js). **The contact details
there are placeholders** — the old `/contact/` page was empty and the database
held no address, phone or public email. Replace them and they update on
`/contact/` and in the footer at once.

### Change the navigation

[`src/navigation.ts`](src/navigation.ts) — one array per menu. External links get
`external: true`, which adds `target="_blank"`, the right `rel`, and a visual
marker.

---

## Project structure

```
src/
  assets/posts/        images for posts (optimised at build time)
  components/          Header, Footer, Seo, PostCard, DocumentList, PageHeader
  content/
    posts/             news + announcements  (Markdown)
    documents/         PDF records           (Markdown)
    pages/             section pages         (Markdown)
  layouts/BaseLayout.astro
  lib/format.ts        date + file-size formatting
  pages/               routes (see below)
  styles/global.css    ALL design tokens live here
  content.config.ts    zod schemas for the three collections
  navigation.ts        menus
  redirects.json       old URL -> new URL map
  site.js              site title, URL, contact details
public/
  documents/           the PDFs themselves
  fonts/               self-hosted variable fonts
scripts/
  gen-redirects.mjs    writes _redirects + vercel.json from redirects.json
  verify-build.mjs     the `npm test` suite
```

### Routes

| File                                      | Generates                                                    |
| ----------------------------------------- | ------------------------------------------------------------ |
| `pages/index.astro`                       | `/`                                                          |
| `pages/[year]/[month]/[day]/[slug].astro` | the 17 posts and documents, at their original WordPress URLs |
| `pages/[page].astro`                      | the 5 section pages                                          |
| `pages/actualites/index.astro`            | `/actualites/`                                               |
| `pages/documents/index.astro`             | `/documents/`                                                |
| `pages/contact.astro`                     | `/contact/`                                                  |
| `pages/404.astro`                         | `/404`                                                       |
| `pages/rss.xml.ts`                        | `/rss.xml`                                                   |
| `pages/robots.txt.ts`                     | `/robots.txt`                                                |

`sitemap-index.xml` comes from `@astrojs/sitemap`.

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

Fonts are **Manrope** and **Platypi**, both SIL OFL, both self-hosted from
`public/fonts/` as variable fonts. No CDN, no Google Fonts, nothing to break.

---

## Deploying

The site is fully static — `dist/` can go on any host.

**Netlify** — build `npm run build`, publish `dist`. `public/_redirects` is
generated automatically and ships with the build.

**Vercel** — build `npm run build`, output `dist`. `vercel.json` at the repo root
carries the redirects.

Both files are generated from `src/redirects.json` on every build, so edit that
one file and never the outputs.

Set the production domain in `src/site.js` (`SITE.url`). It drives canonical
URLs, the sitemap and Open Graph tags.

---

## Source material

`archive/` holds the original WordPress `wp-content` and SQL dump. It is
**read-only reference**, gitignored, and not part of the build. Nothing in
`src/` reads from it at build time — the migration was a one-off.
