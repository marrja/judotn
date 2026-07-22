/**
 * Site navigation, rebuilt from the WordPress `Judo Menu` (primary) and
 * `Judo Top Menu` (top) nav_menu terms.
 *
 * In WordPress the five primary items pointed at `#` and had no pages behind
 * them. They now resolve to real stub pages under src/content/pages/ — see
 * the README for how to fill them in.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Off-site links get rel/target treatment and an external marker. */
  external?: boolean;
  children?: NavItem[];
};

export const primaryNav: NavItem[] = [
  { label: 'La Fédération', href: '/la-federation/' },
  {
    label: 'Direction Technique',
    href: '/direction-technique/',
    children: [
      {
        label: 'Équipes Nationales',
        href: 'https://www.tunisie-judo.org/equipesnationales.html',
        external: true,
      },
    ],
  },
  { label: 'Activités', href: '/activites/' },
  { label: 'Techniques', href: '/techniques/' },
  {
    label: 'Espace Clubs',
    href: '/espace-clubs/',
    children: [
      {
        label: 'Gestion des licences',
        href: 'https://www.tunisie-judo.org/licence.html',
        external: true,
      },
      { label: 'Statistiques', href: 'https://www.tunisie-judo.org/affstat.php', external: true },
      { label: 'Résultats', href: 'https://www.tunisie-judo.org/resultats.html', external: true },
    ],
  },
  { label: 'Documents', href: '/documents/' },
  { label: 'Actualités', href: '/actualites/' },
];

export const utilityNav: NavItem[] = [
  { label: 'Documents', href: '/documents/' },
  { label: 'Contact', href: '/contact/' },
];

export const usefulLinks: NavItem[] = [
  { label: 'Fédération Internationale de Judo', href: 'https://www.ijf.org/', external: true },
  { label: 'Union Africaine de Judo', href: 'https://www.africajudo.org/', external: true },
  { label: 'Le Kodokan', href: 'https://kdkjudo.org/en/', external: true },
  { label: 'Académie de la FIJ', href: 'https://academy.ijf.org/', external: true },
  {
    label: 'Ministère de la Jeunesse et du Sport',
    href: 'http://www.sport.tn/index.php/ar/',
    external: true,
  },
];

export const olympicLinks: NavItem[] = [
  { label: 'Comité Olympique International', href: 'https://olympics.com/cio', external: true },
  { label: 'Comité Olympique National Tunisien', href: 'http://www.cnot.org.tn/', external: true },
  {
    label: 'Comité Paralympique Tunisien',
    href: 'https://www.paralympic.org/tunisia',
    external: true,
  },
  { label: 'Histoire du judo', href: 'https://fr.wikipedia.org/wiki/Judo', external: true },
];

/** The eight values of the code moral du judo, in their traditional order. */
export const codeMoral = [
  'La politesse',
  'Le courage',
  'La sincérité',
  "L'honneur",
  'La modestie',
  'Le respect',
  'Le contrôle de soi',
  "L'amitié",
] as const;
