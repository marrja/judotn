import type { APIRoute } from 'astro';
import { SITE } from '../site.js';

/**
 * https://llmstxt.org/ — a plain-text map of the site for AI crawlers and
 * answer engines. Kept concise and stable: the exhaustive per-language URL list
 * lives in the sitemap, which this file points at, so it needs no rebuild when
 * a post is added.
 */
const u = (path: string) => new URL(path, SITE.url).href;

const body = `# Fédération Tunisienne de Judo (FTJUDO)

> Site officiel de la Fédération Tunisienne de Judo : actualités des équipes
> nationales, documents officiels et réglementaires, et informations sur le judo
> et les disciplines associées (aïkido, kendo) en Tunisie. Contenu trilingue —
> français, anglais, arabe — sous les préfixes /fr/, /en/, /ar/.

## Pages principales

- [Accueil / Home / الرئيسية (FR)](${u('/fr/')}): page d'accueil, dernières actualités
- [Home (EN)](${u('/en/')}): homepage, latest news
- [الرئيسية (AR)](${u('/ar/')}): الصفحة الرئيسية وآخر الأخبار
- [Actualités](${u('/fr/actualites/')}): communiqués et résultats des équipes nationales
- [Documents](${u('/fr/documents/')}): statuts, règlements et documents officiels (PDF)
- [La Fédération](${u('/fr/la-federation/')}): missions et organisation
- [Direction Technique](${u('/fr/direction-technique/')})
- [Activités](${u('/fr/activites/')})
- [Espace Clubs](${u('/fr/espace-clubs/')})
- [Contact](${u('/fr/contact/')})

## Index complet

- [Plan du site (sitemap)](${u('/sitemap-index.xml')}): toutes les URLs, dans les trois langues
- [Flux RSS](${u('/fr/rss.xml')}): dernières actualités
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
