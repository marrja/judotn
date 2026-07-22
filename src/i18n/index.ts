/**
 * Locale-aware URLs, dates and sizes.
 *
 * Astro ships `getRelativeLocaleUrl()` in `astro:i18n`, which covers what
 * `localePath()` does here. It is deliberately not used: it is a virtual
 * module, so it cannot be imported by the build-verification script or by a
 * plain node test. `stripLocale()` has no Astro equivalent at all and is what
 * the language switcher needs. Keeping both in one pure, testable module beats
 * splitting the pair across two sources of truth.
 */
// Explicit .ts extensions so plain `node` can run this module directly (its
// native type stripping does not do extensionless resolution). Astro's base
// tsconfig already sets `allowImportingTsExtensions`.
import { BCP47, DIR, LOCALES, ui, type Locale } from './ui.ts';

export { LOCALES, LOCALE_NAMES, DIR, BCP47, codeMoral, type Locale } from './ui.ts';

/**
 * Every language is served under its own prefix — `/fr/`, `/en/`, `/ar/`. The
 * bare root `/` is a browser-language detector that redirects into one of them
 * (see src/pages/index.astro); old un-prefixed WordPress permalinks are
 * 301-redirected to their `/fr/` equivalent by the generated .htaccess.
 */

/**
 * The language the source content and the official PDFs are authored in. Used
 * where "which language is this really written in" matters — e.g. the "PDF in
 * French only" note — and as the typing base for the UI dictionary. It is NOT a
 * routing default any more: nothing is served unprefixed.
 */
export const DEFAULT_LOCALE: Locale = 'fr';

/**
 * The language a visitor gets when their browser asks for none we publish, and
 * the target of the `x-default` hreflang. English, per the site's language
 * policy.
 */
export const FALLBACK_LOCALE: Locale = 'en';

export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);

/** `t('ar')('nav.news')` → 'الأخبار'. */
export const useTranslations =
  (lang: Locale) =>
  (key: keyof (typeof ui)['fr']): string =>
    ui[lang][key];

/** The value of the `[lang]` route param for a locale — the locale itself. */
export const langParam = (lang: Locale): string => lang;

/** Every locale as a `getStaticPaths` param entry. */
export const localeParams = () => LOCALES.map((lang) => ({ params: { lang: langParam(lang) } }));

/** Read the `[lang]` route param back into a Locale. */
export const localeFromParam = (param: string | undefined): Locale =>
  isLocale(param) ? param : FALLBACK_LOCALE;

/**
 * Prefix a root-relative path for a locale.
 * `('en', '/documents/')` → `/en/documents/`. Every locale is prefixed.
 */
export function localePath(lang: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`;
}

/**
 * Inverse of `localePath`: split a prefixed pathname into its locale and the
 * canonical (un-prefixed) path. Used by the language switcher and by hreflang
 * to point at the current page's counterpart in each language.
 *
 * A pathname whose first segment is not a locale (the root detector, robots,
 * the 404) has no locale to strip; it reports the fallback and is returned
 * unchanged, which none of those callers use for routing.
 */
export function stripLocale(pathname: string): { lang: Locale; path: string } {
  const [, first = '', ...rest] = pathname.split('/');
  if (isLocale(first)) {
    return { lang: first, path: `/${rest.join('/')}` };
  }
  return { lang: FALLBACK_LOCALE, path: pathname };
}

/** Every locale's URL for the same page, for hreflang and the switcher. */
export const alternates = (pathname: string) => {
  const { path } = stripLocale(pathname);
  return LOCALES.map((lang) => ({ lang, dir: DIR[lang], href: localePath(lang, path) }));
};

/**
 * Formatting locales, which are NOT the same as the `lang`/hreflang tags.
 *
 * `en-GB` because plain `en` formats US-style ("July 21, 2026"), and this site
 * shows day-first dates in the other two languages — mixing the orders inside
 * one site reads as a bug. hreflang stays the broader `en`.
 */
const DATE_LOCALE: Record<Locale, string> = { fr: BCP47.fr, en: 'en-GB', ar: BCP47.ar };

// Intl objects are expensive to construct; the static build formats a few
// hundred dates, so build one formatter per locale and reuse it.
const dateFormatters = new Map<Locale, Intl.DateTimeFormat>();

/**
 * "25 juin 2024" / "25 June 2024" / "25 جوان 2024".
 *
 * `ar-TN` rather than `ar` on purpose: it yields the Tunisian month names
 * borrowed from French (جانفي, فيفري, جوان, جويلية) instead of the Mashriq
 * set (يناير, فبراير, يونيو, يوليو), and keeps Latin digits — both are what
 * Tunisian readers expect and neither is what generic `ar` produces.
 *
 * UTC-pinned so the build is reproducible across machines and time zones.
 */
export function formatDate(lang: Locale, d: Date): string {
  let fmt = dateFormatters.get(lang);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(DATE_LOCALE[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    dateFormatters.set(lang, fmt);
  }
  return fmt.format(d);
}

/**
 * Human file size for download links. Decimal MB/kB, which is what browsers
 * and file managers show, with one decimal below 10 MB.
 */
export function formatBytes(lang: Locale, bytes: number): string {
  const u = ui[lang];
  if (bytes < 1000) return `${bytes} ${u['unit.bytes']}`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} ${u['unit.kilobytes']}`;
  const mb = bytes / 1_000_000;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} ${u['unit.megabytes']}`;
}
