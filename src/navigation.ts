/**
 * Site navigation, rebuilt from the WordPress `Judo Menu` (primary) and
 * `Judo Top Menu` (top) nav_menu terms.
 *
 * In WordPress the five primary items pointed at `#` and had no pages behind
 * them. They now resolve to real stub pages under src/content/pages/ — see
 * the README for how to fill them in.
 *
 * Everything is built per-locale: labels come from the translation dictionary
 * and internal hrefs are prefixed for the language. External links keep their
 * own address, but their label is still translated.
 */
import { localePath, useTranslations, type Locale } from './i18n/index.ts';

export type NavItem = {
  label: string;
  href: string;
  /** Off-site links get rel/target treatment and an external marker. */
  external?: boolean;
  children?: NavItem[];
};

export function primaryNav(lang: Locale): NavItem[] {
  const t = useTranslations(lang);
  const at = (path: string) => localePath(lang, path);

  return [
    { label: t('nav.federation'), href: at('/la-federation/') },
    {
      label: t('nav.technicalDirection'),
      href: at('/direction-technique/'),
      children: [
        {
          label: t('nav.nationalTeams'),
          href: 'https://www.tunisie-judo.org/equipesnationales.html',
          external: true,
        },
      ],
    },
    { label: t('nav.activities'), href: at('/activites/') },
    { label: t('nav.techniques'), href: at('/techniques/') },
    {
      label: t('nav.clubs'),
      href: at('/espace-clubs/'),
      children: [
        {
          label: t('nav.licences'),
          href: 'https://www.tunisie-judo.org/licence.html',
          external: true,
        },
        {
          label: t('nav.statistics'),
          href: 'https://www.tunisie-judo.org/affstat.php',
          external: true,
        },
        {
          label: t('nav.results'),
          href: 'https://www.tunisie-judo.org/resultats.html',
          external: true,
        },
      ],
    },
    { label: t('nav.documents'), href: at('/documents/') },
    { label: t('nav.news'), href: at('/actualites/') },
  ];
}

export function utilityNav(lang: Locale): NavItem[] {
  const t = useTranslations(lang);
  return [
    { label: t('nav.documents'), href: localePath(lang, '/documents/') },
    { label: t('nav.contact'), href: localePath(lang, '/contact/') },
  ];
}

export function usefulLinks(lang: Locale): NavItem[] {
  const t = useTranslations(lang);
  return [
    { label: t('link.ijf'), href: 'https://www.ijf.org/', external: true },
    { label: t('link.africaJudo'), href: 'https://www.africajudo.org/', external: true },
    { label: t('link.kodokan'), href: 'https://kdkjudo.org/en/', external: true },
    { label: t('link.ijfAcademy'), href: 'https://academy.ijf.org/', external: true },
    { label: t('link.ministry'), href: 'http://www.sport.tn/index.php/ar/', external: true },
  ];
}

export function olympicLinks(lang: Locale): NavItem[] {
  const t = useTranslations(lang);
  return [
    { label: t('link.ioc'), href: 'https://olympics.com/cio', external: true },
    { label: t('link.nocTunisia'), href: 'http://www.cnot.org.tn/', external: true },
    {
      label: t('link.paralympicTunisia'),
      href: 'https://www.paralympic.org/tunisia',
      external: true,
    },
    { label: t('link.judoHistory'), href: 'https://fr.wikipedia.org/wiki/Judo', external: true },
  ];
}
