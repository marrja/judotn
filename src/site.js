/**
 * Site-wide values that are not language-dependent.
 * Plain JS (not .ts) so astro.config.mjs can import it directly.
 *
 * Anything with words in it now lives in src/i18n/ui.ts instead — the title,
 * description and locale that used to sit here are per-language.
 */
export const SITE = {
  url: 'https://judo.tn',
};

/**
 * Contact rows. Labels are translated at render time from `labelKey`; only the
 * values themselves are shared across languages, since an address and a phone
 * number do not change with the reader.
 *
 * TODO: these are placeholders. The original WordPress `/contact/` page was
 * empty and the database held no address, phone or public email, so there was
 * nothing to migrate. Fill in `value` (and `href` where it makes sense) with
 * the federation's real details — they are used on /contact/ and in the footer.
 * A null `value` renders as the translated "to be completed" placeholder.
 *
 * @type {{labelKey: 'contact.address' | 'contact.phone' | 'contact.email',
 *         value: string | null, href: string | null}[]}
 */
export const CONTACT = [
  { labelKey: 'contact.address', value: null, href: null },
  { labelKey: 'contact.phone', value: null, href: null },
  { labelKey: 'contact.email', value: null, href: null },
];
