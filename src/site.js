/**
 * Single source of truth for site-wide values.
 * Plain JS (not .ts) so astro.config.mjs can import it directly.
 *
 * TODO: the contact details below are placeholders. The original WordPress
 * `/contact/` page was empty and the database held no address, phone or
 * public email, so there was nothing to migrate. Replace these with the
 * federation's real details — they are used on /contact/ and in the footer.
 */
export const SITE = {
  url: 'https://judo.tn',
  title: 'Fédération Tunisienne de Judo',
  shortTitle: 'FTJUDO',
  description:
    'Site officiel de la Fédération Tunisienne de Judo (FTJUDO) : actualités, ' +
    'documents officiels, règlements et informations sur le judo tunisien.',
  lang: 'fr',
  locale: 'fr_TN',
};

/** @type {{label: string, value: string, href: string | null}[]} */
export const CONTACT = [
  { label: 'Adresse', value: 'À compléter', href: null },
  { label: 'Téléphone', value: 'À compléter', href: null },
  { label: 'E-mail', value: 'À compléter', href: null },
];
