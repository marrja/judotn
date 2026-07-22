/**
 * Locale-aware access to the content collections.
 *
 * Entry ids are `<locale>/<key>` because each collection is split one
 * directory per language (see src/content.config.ts). Nothing outside this
 * module should have to know that.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '../i18n/index.ts';

type Localised = 'posts' | 'documents' | 'pages';
/** The collections whose entries carry a `date` and sort chronologically. */
type Dated = 'posts' | 'documents';
type Entry<C extends Localised> = CollectionEntry<C>;

/** `posts/fr/communique` -> `fr`. */
export const localeOf = (entry: { id: string }): Locale => {
  const first = entry.id.split('/')[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
};

/**
 * `posts/fr/communique` -> `communique`. Entries sharing a key across locales
 * are translations of each other.
 */
export const keyOf = (entry: { id: string }): string =>
  entry.id.split('/').slice(1).join('/') || entry.id;

/** Newest first. Both news and documents are presented in reverse chronology. */
const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

/** Every entry of a dated collection in one language, newest first. */
export async function getLocalized<C extends Dated>(
  collection: C,
  lang: Locale,
): Promise<Entry<C>[]> {
  const entries = await getCollection(collection, ({ id }: { id: string }) =>
    id.startsWith(`${lang}/`),
  );
  return (entries as Entry<C>[]).sort(byDateDesc);
}

/** Editorial pages for one language, in their authored order, drafts excluded. */
export async function getLocalizedPages(lang: Locale): Promise<Entry<'pages'>[]> {
  const entries = await getCollection(
    'pages',
    ({ id, data }: { id: string; data: { draft: boolean } }) =>
      id.startsWith(`${lang}/`) && !data.draft,
  );
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/** The URL an entry is served at in its own language. */
export const entryHref = (entry: Entry<'posts'> | Entry<'documents'>): string =>
  localePath(localeOf(entry), entry.data.url);

/**
 * Split a canonical `/YYYY/MM/DD/slug/` url into route params.
 * The date parts come from the url rather than from `date` so the published
 * address can never drift from the frontmatter timestamp.
 */
export function urlToParams(url: string) {
  const [, year, month, day, slug] = url.split('/');
  return { year, month, day, slug };
}
