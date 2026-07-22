# Design: trilingual judo.tn (FR / EN / AR)

**Date:** 2026-07-22
**Status:** implemented

Make the Fédération Tunisienne de Judo site available in French, English and
Arabic, and publish two Arabic-sourced news posts (the African cadet
championship delegation, dated 21-07-2026, and a coach-training day, dated
12-07-2026).

## Constraints that shaped everything

- **French must stay at the un-prefixed root.** Every URL inherited from
  WordPress is a French permalink (`/2024/06/25/slug/`), and `verify-build.mjs`
  fails if one stops resolving. So only English and Arabic can take a path
  prefix. Astro's `i18n.routing.prefixDefaultLocale: false` produces exactly
  this shape — verified empirically with a throwaway `[...lang]/probe` route
  before committing to the design.
- **Content is tiny** (~9 KB of Markdown; every post is a title + image with a
  near-empty body, every page a placeholder stub), so translating it by hand is
  hours, not weeks. The real work is the chrome: ~100 UI strings, RTL, and an
  Arabic typeface.
- **RTL is a correctness issue, not just mirroring.** The design leans on
  `letter-spacing` + `text-transform: uppercase`, both of which break cursive,
  unicameral Arabic. That treatment is stripped under `[dir='rtl']`.

## Architecture

- **Routing:** one `[...lang]/` route tree. The leading rest param is `undefined`
  for French (root) and `en`/`ar` for the others. Seven route files instead of
  eighteen.
- **Content:** one directory per locale — `content/{posts,documents,pages}/{fr,en,ar}/`.
  The **filename is the translation key**: same name across locales = same item,
  which is all the language switcher needs. No `translationKey` field. A
  frontmatter `slug` field is forbidden (Astro's glob loader treats it as an id
  override, which would collapse the three locales onto one id).
- **Routing key rename:** `legacyUrl`/`legacySlug` → `url` (slug dropped, derived
  from `url`). "Legacy" became a lie the moment the first never-in-WordPress post
  was published.
- **UI strings:** `src/i18n/ui.ts`, French as the typed source of truth
  (`Record<keyof typeof fr, string>` for en/ar), so a missing key is a compile
  error, not a runtime blank.
- **Locale helpers:** `src/i18n/index.ts` — `localePath`, `stripLocale`,
  `alternates`, `formatDate`, `formatBytes`. Pure and node-testable.
- **Per-component locale:** every component derives its locale from the pathname
  via `stripLocale`, not from a drilled prop. One source of truth (the URL).

## Localisation details

- **Dates:** `ar-TN` (Tunisian month names — جويلية not يوليو — and Latin
  digits), and `en-GB` for English so all three are day-first. hreflang keeps the
  broader `en`.
- **Arabic type:** self-hosted Noto Sans Arabic Variable, `unicode-range`-scoped
  and preloaded only on `/ar/`.
- **RTL:** logical properties throughout; a `[dir='rtl']` block strips
  spaced-uppercase treatment and flips the two hand-tuned physical bits
  (nav-underline `transform-origin`, the document-list arrow).
- **Documents:** French-only PDFs; en/ar pages show a "published in French only"
  note.
- **404:** one French page (Apache serves a single `ErrorDocument`), linking all
  three home pages.

## Verification (no browser, per project rule)

- `astro check` — missing UI translation key fails the build.
- `scripts/test-i18n.mjs` — 17 unit tests over the locale helpers and dictionary.
- `scripts/verify-build.mjs` — routed permalinks resolve (French at root),
  tri-locale parity, hreflang completeness, `dir="rtl"` on Arabic, Arabic dates
  rendered with Tunisian month names, Arabic font not preloaded on Latin builds.

## Flagged for the federation

- **"Cadets" vs "Juniors":** the Arabic source says الأصاغر (cadets, U18); the
  supplied image filename said "Juniors". Titled as cadets, following the Arabic.
- **Native review:** the English and Arabic strings were authored during
  migration, not supplied by the federation. A native speaker should review the
  Arabic before go-live.
