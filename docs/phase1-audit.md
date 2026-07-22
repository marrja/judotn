# Phase 1 — WordPress Audit

**Source (read-only):** `archive/sowhentakolor_wpjudo.sql` (15 MB, prefix `tnjp_`) + `archive/wp-content/`
**Audited:** 2026-07-22

---

## 0. Headline finding — this is _two_ websites in one database

The install began life as **AATUJA — Association d'Amitié Tunisie-Japon** (`tunisia-japan.org`) and was **partially rebranded in June 2024** into the **Fédération Tunisienne de Judo (FTJUDO)**. The rebrand was never finished. Both identities are live in the same database.

| Signal                                 | Tunisia-Japan (old)                             | Judo Federation (new)                                            |
| -------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `blogname` / `blogdescription`         | —                                               | **Fédération Tunisienne de Judo** / _Site Officiel de la FTJUDO_ |
| Site icon (favicon)                    | —                                               | `2024/06/cropped-logo.jpg` (FTJudo logo)                         |
| Header logo (`custom_logo`)            | **`association-tunisie-japon.png`**             | —                                                                |
| Homepage (`page_on_front`=314)         | —                                               | **Judo** ("L'école de la vie / Le Judo")                         |
| `/about-us/`, `/members-board/`        | **AATUJA** content                              | —                                                                |
| `/sample-page/`, `/projets/`, `/news/` | **AATUJA**, mostly Lorem ipsum                  | —                                                                |
| Primary nav (`primary` → term 45)      | —                                               | **Judo Menu**                                                    |
| Top nav (`top` → term 46)              | —                                               | **Judo Top Menu**                                                |
| Mobile nav (`mobile` → term 44)        | **"mobile menu"** (Japan Embassy, JICA, TICAD…) | —                                                                |

**Live bug in the current site:** desktop shows the Judo menus, mobile shows the _old Tunisia-Japan_ menu. Visitors on phones see a different site.

This is the single biggest decision blocking Phase 2 → see **Question 1**.

---

## 1. Site settings

| Setting        | Value                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Site title     | Fédération Tunisienne de Judo                                                                            |
| Tagline        | Site Officiel de la FTJUDO                                                                               |
| URL            | `https://judo.takolor.com` (staging; content also references `judo.takolor.net` and `tunisia-japan.org`) |
| Language       | `fr_FR` — **single language**, no WPML/Polylang tables                                                   |
| Permalinks     | `/%year%/%monthnum%/%day%/%postname%/`                                                                   |
| Front page     | Static → page **314** ("Home", slug `elementor-314`)                                                     |
| Posts page     | **None set** (`page_for_posts = 0`) — there is no blog index                                             |
| Posts per page | 10                                                                                                       |
| Theme          | The7 (`dt-the7`) + child `dt-the7-child` (child is **empty** — zero custom code/CSS)                     |
| Comments       | Open by default, but **0 comments exist**                                                                |

---

## 2. Content inventory

### Published pages — 8 (+1 draft)

| ID  | Title           | Current URL             | Identity | Real content?                                              |
| --- | --------------- | ----------------------- | -------- | ---------------------------------------------------------- |
| 314 | Home            | `/`                     | **Judo** | Yes — hero + 3 dynamic carousels                           |
| 590 | Documents       | `/documents/`           | **Judo** | Shell only — one dynamic grid widget                       |
| 258 | Contact         | `/contact/`             | **Judo** | **EMPTY** — zero content, no form                          |
| 348 | About us        | `/about-us/`            | AATUJA   | Yes — ~4 real paragraphs                                   |
| 793 | Members & Board | `/members-board/`       | AATUJA   | Yes — 12 board + 7 members, photos                         |
| 2   | Home --         | `/sample-page/`         | AATUJA   | **Lorem ipsum** + orphaned old homepage                    |
| 209 | Projets         | `/sample-page/projets/` | AATUJA   | **Mostly Lorem ipsum**                                     |
| 232 | News            | `/sample-page/news/`    | AATUJA   | Mixed — 4 real project write-ups + Lorem ipsum             |
| 3   | Privacy Policy  | _(draft)_               | —        | WordPress boilerplate, unedited, cites `tunisia-japan.org` |

### Published posts — 17

| Category          | Count | Notes                                                                                      |
| ----------------- | ----- | ------------------------------------------------------------------------------------------ |
| **Documents**     | 10    | Each post body is **only** a `[pdf-embedder url="…"]` shortcode. No prose.                 |
| **News**          | 5     | **Bodies are empty.** Content is the title + featured image (a Facebook-style image post). |
| **Announcements** | 2     | 1 empty body; 1 is a bare `<img>` tag.                                                     |

All 17 are authored by "TAKOLOR INTERNATIONAL". Newest post: **2024-06-25** — the site has been dormant for ~2 years.

### Taxonomies

- **Categories used:** News (5), Documents (10), Announcements (2)
- **Categories unused (count 0):** Diplomacy, Economy, Tourism, Culture, Sport — AATUJA leftovers
- **Tags:** 15 defined, only 2 ever used (`Pascal LIVOLSI`, `Kendo`, 1 post each)

### Not migrating (rationale)

| Type                                                  | Count   | Why                                                                                                  |
| ----------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `revision`                                            | 445     | Editing history                                                                                      |
| `flamingo_inbound` / `flamingo_contact`               | 19 / 20 | **Stored form submissions containing personal data** (names, emails, phones). Deliberately excluded. |
| `ml-slide` / `ml-slider`                              | 13 / 2  | MetaSlider sliders, referenced only by the dead `/sample-page/`                                      |
| `vc_grid_item`                                        | 1       | WPBakery leftover                                                                                    |
| `nav_menu_item`                                       | 52      | Rebuilt as config, not content                                                                       |
| `e-landing-page`, `wp_global_styles`, `wp_navigation` | 3       | Builder scaffolding                                                                                  |

---

## 3. Navigation (as currently wired)

**Judo Menu** → `primary` (desktop main nav)

```
La Fédération          → #     ← placeholder, no target
Direction Technique    → #     ← placeholder
  └ Equipes Nationales → tunisie-judo.org/equipesnationales.html  (external)
Activités              → #     ← placeholder
Techniques             → #     ← placeholder
Espace Clubs           → #     ← placeholder
  ├ Gestion des licences → tunisie-judo.org/licence.html   (external)
  ├ Statistiques         → tunisie-judo.org/affstat.php    (external)
  └ Résultats            → tunisie-judo.org/resultats.html (external)
```

**5 of 6 top-level items go nowhere.** The federation's own sections were never built — real content lives on a separate legacy site, `tunisie-judo.org`.

**Judo Top Menu** → `top` (utility bar) — all working

```
Liens utiles ▸ Ministère jeunesse & sport · IJF · Union africaine de judo ·
               Kodokan · Académie FIJ · Histoire du judo (Wikipedia)
L'Olympisme  ▸ CIO · CNOT · Comité paralympique · Paris 2024 · Histoire des JO
Documents    → /documents/
Contact      → /contact/
```

**mobile menu** → `mobile` — the stale AATUJA menu (Home, About us, Members & Board, Partners ▸ Japanese Embassy / JICA / Kendo League / Atlantis Voyages / Fondation ABA / TAKOLOR, TICAD Games, Documents, Contact).

---

## 4. Design tokens extracted from the live theme

From `uploads/the7-css/css-vars.css` (The7's compiled output — the real rendered values):

| Token              | Value                                                             |
| ------------------ | ----------------------------------------------------------------- |
| **Accent / brand** | **`#ac1e36`** (deep crimson — 82 uses, the dominant brand colour) |
| Secondary          | `#5daadd` (light blue)                                            |
| Body text          | `#333333` · muted `#8b8d94`                                       |
| Page background    | `#eef0f1`                                                         |
| Body font          | **Roboto Slab**, 15px / 1.5                                       |
| Menu font          | Roboto Slab 14px                                                  |
| Container          | 1280px · border-radius **0**                                      |

Elementor's own kit stores `#6EC1E4` / `#61CE70` / Roboto — these are **stock Elementor defaults, never customised**. Ignore them; `#ac1e36` is the real brand.

**Logo:** `uploads/2024/06/logo.jpg` — circular red judo-mat motif, Tunisian crescent & star, black judoka silhouette, "FTJudo" wordmark. Red / white / black. _(JPEG with white background — see Question 6.)_

---

## 5. Plugins → what must be replicated

| Plugin                                                     | User-facing feature                    | Action in Astro                                           |
| ---------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| **Elementor** + The7 Core + Happy Addons                   | Page builder                           | **Drop.** Extract content, rebuild as components.         |
| **Contact Form 7** + Ultimate Addons                       | 1 multi-step "Registration Form"       | **Rebuild** — see §6                                      |
| **Flamingo**                                               | Stores submissions in DB               | Drop (handled by form backend)                            |
| **PDF Embedder**                                           | Inline PDF viewer on 10 Document posts | **Replace** — native `<embed>`/link + download            |
| **Yoast SEO**                                              | Meta tags, sitemap                     | **Replace** with Astro SEO component + `@astrojs/sitemap` |
| **Slider Revolution** / MetaSlider                         | Homepage sliders                       | **Drop** — only used by the dead `/sample-page/`          |
| **Akismet**                                                | Comment spam                           | Drop — no comments                                        |
| **Sucuri Scanner**                                         | Security scanning                      | Drop (server-side concern; see §7)                        |
| **Classic Editor, Duplicate Menu, Health Check, The7 CLI** | Admin-only                             | Drop                                                      |

---

## 6. Contact form — content mismatch

There is exactly **one** form (`wpcf7_contact_form` #7, "Registration Form"), and it is an **AATUJA membership application**, not a judo contact form. Two steps, 13 fields:

_Step 1 — Personal information:_ name\*, email\*, phone\*
_Step 2 — About the association:_ 1st sponsor\*, 2nd sponsor\*, why join\*, member of similar association\* (Yes/No), skills\*, ready to engage\* (Yes/No), accept rules\* (Yes/No), pay annual dues\* (Yes/No), suggestions, how did you hear\*, consent checkbox\*

Notification goes to `marouene.jarraya@gmail.com` from `wordpress@tunisia-japan.org`.

**The `/contact/` page is completely empty — this form is not embedded anywhere.** See Question 4.

---

## 7. Media

`archive/wp-content/uploads/` — 923 files, **649 MB**… but:

- **545 MB is Sucuri scanner junk** (`sucuri-oldfailedlogins.php` 396 MB, `sucuri-auditqueue.php` 148 MB). Not media. Discard.
- **Actual media: ~102 MB**, 162 original files (the other ~760 are WordPress-generated thumbnails, which Astro's `<Image>` will regenerate).

|                                 | Count  |
| ------------------------------- | ------ |
| Attachments in DB               | 95     |
| Referenced by published content | 58     |
| Used only as featured image     | 11     |
| **Orphaned**                    | **26** |

- **Images:** 66 JPEG, 16 PNG, 1 WebP
- **PDFs:** 12 — **10 referenced** (the Documents posts), 2 orphaned: `Rapport-moral-2023.pdf`, `Rapport-financier-2023.pdf` (AATUJA annual reports)
- Largest content PDF: `reglement-arbitrage-IJF-aout-2020.pdf` (9.9 MB)
- `uploads/2025/` and `uploads/2026/` are **empty** — confirms dormancy since mid-2024.

---

## 8. SEO — nothing to carry over

The `tnjp_yoast_indexable` table has **13 indexable pages/posts with empty `title` and empty `description` on every single row.** No canonicals set, no noindex flags. Yoast was installed but never configured — the site has been running on default titles this whole time.

**Implication:** there is no SEO metadata to migrate. I'll write fresh titles and descriptions per page as part of Phase 3. Open Graph images can be derived from the existing featured images.

---

## 9. Dynamic features — flagged, not silently dropped

| Feature                                              | Present?                                   | Recommendation                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Search**                                           | Yes — a search widget in the sidebar       | Static site: either drop, or add client-side search over ~25 pages. Small enough that a tiny JSON index is trivial. **See Question 5.** |
| **Comments**                                         | Enabled, **0 ever posted**                 | Drop.                                                                                                                                   |
| **WooCommerce / e-commerce**                         | **No** — no Woo tables                     | N/A                                                                                                                                     |
| **User accounts / login**                            | 1 admin user only                          | Drop.                                                                                                                                   |
| **Homepage carousels** (Documents / Annonces / News) | Yes — The7 dynamic queries                 | Rebuild statically from content collections.                                                                                            |
| **Documents page grid**                              | Yes — WPBakery masonry grid of category 21 | Rebuild as a static document list.                                                                                                      |
| **Form submission**                                  | CF7 → email + DB                           | Needs a static-friendly backend. **See Question 4.**                                                                                    |
| **PDF inline viewer**                                | Yes                                        | Native browser embed + download link.                                                                                                   |

---

## 10. Proposed sitemap for the new site

Assuming the **Judo Federation** identity (pending Question 1):

```
/                                   Home
/documents/                         Document library (10 PDFs)
/contact/                           Contact
/actualites/          (or /news/)   News index          ← NEW, doesn't exist today
/{yyyy}/{mm}/{dd}/{slug}/           17 posts (URLs preserved)
/category/news/
/category/documents/
/category/announcements/
/404
/rss.xml, /sitemap.xml, /robots.txt
```

**URL preservation:** all 17 post URLs and `/documents/`, `/contact/`, `/about-us/`, `/members-board/` carry over unchanged. `/sample-page/*` would be redirected or dropped (Question 2).

---

## ❓ Open questions — I need your answers before Phase 2

**1. Which site am I building? (blocking)**

- **(a) Judo Federation only** — drop AATUJA pages (`/sample-page/`, `/projets/`, `/news/`, `/about-us/`, `/members-board/`). _My recommendation_ — matches the site title, favicon, homepage and both active desktop menus.
- **(b) Judo Federation, keeping About us + Members & Board**, rewritten for the federation (I'd need federation board names from you).
- **(c) Keep both** as one dual-purpose site.
- **(d) Build the AATUJA site instead.**

**2. The Lorem ipsum pages** — `/sample-page/` (old homepage), `/projets/`, `/news/` contain placeholder text. Drop entirely, or do you have real copy for them?

**3. The empty "Judo Menu"** — La Fédération, Direction Technique, Activités, Techniques, Espace Clubs all point to `#`. Options: **(a)** omit them until you have content, **(b)** create stub pages I fill with placeholder text, **(c)** point them at `tunisie-judo.org`, **(d)** you supply the content now.

**4. Contact form** — the only form is an _AATUJA membership application_. Do you want:

- a simple judo contact form (name / email / subject / message), or
- the full 13-field membership form kept as-is, or
- both?

And which backend — **Formspree**, **Netlify Forms**, or something else? (This also decides the redirects file format in Phase 3.)

**5. Search** — the old sidebar had a search box. Keep it (small client-side index) or drop it?

**6. Logo** — the only FTJudo logo I have is `uploads/2024/06/logo.jpg`, a **JPEG with a baked-in white background** at modest resolution. Do you have an SVG or transparent PNG? Without one the logo will look dated on any non-white header.

**7. Domain** — content mixes `judo.takolor.com`, `judo.takolor.net` and `tunisia-japan.org`. What is the real production domain? (Needed for canonicals, sitemap and OG tags.)

**8. Draft Privacy Policy** — unedited WordPress boilerplate naming `tunisia-japan.org`. Drop, or shall I write a real one?

**9. Dormant content** — nothing published since June 2024. Migrate all 17 posts as-is, or archive the older ones?

**10. Orphaned AATUJA reports** — `Rapport-moral-2023.pdf` and `Rapport-financier-2023.pdf` are uploaded but linked from nowhere. Publish them on the Documents page, or leave them out?
