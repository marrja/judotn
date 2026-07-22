import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  BCP47,
  localeFromParam,
  localeParams,
  localePath,
  useTranslations,
} from '../../i18n/index.ts';
import { getLocalized } from '../../lib/content.ts';

/** One feed per language: /rss.xml, /en/rss.xml, /ar/rss.xml. */
export const getStaticPaths = localeParams;

export async function GET(context: APIContext) {
  const lang = localeFromParam(context.params.lang as string | undefined);
  const t = useTranslations(lang);

  const posts = await getLocalized('posts', lang);
  const documents = await getLocalized('documents', lang);

  const items = [...posts, ...documents]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      link: localePath(lang, entry.data.url),
      categories: [entry.collection === 'documents' ? t('documents.title') : t('news.title')],
    }));

  return rss({
    title: t('site.title'),
    description: t('site.description'),
    site: context.site!,
    items,
    customData: `<language>${BCP47[lang]}</language>`,
  });
}
