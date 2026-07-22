/**
 * Browser-language detection for the root redirect page.
 *
 * This module is imported BOTH by a Node test and by the client `<script>` on
 * `src/pages/index.astro`, so it must stay tiny and DOM-free — no import of the
 * UI dictionary, which would drag every translation into the redirect page's
 * bundle. The locale list is duplicated from ui.ts on purpose and a unit test
 * asserts the two never drift.
 */

/** Languages this site publishes, in the order preference ties break. */
export const DETECT_LOCALES: readonly string[] = ['fr', 'en', 'ar'];

/** Where a visitor lands when their browser asks for none of the above. */
export const DETECT_FALLBACK = 'en';

/**
 * Pick the best published language for a browser's ordered preference list
 * (e.g. `navigator.languages`, `['fr-FR', 'fr', 'en-US']`). Matches on the base
 * subtag, so `ar-TN` and `en-GB` resolve to `ar` and `en`. Returns the fallback
 * when nothing matches.
 */
export function pickLocale(preferred: readonly string[] | undefined): string {
  for (const tag of preferred ?? []) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (DETECT_LOCALES.includes(base)) return base;
  }
  return DETECT_FALLBACK;
}
