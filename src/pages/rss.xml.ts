import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../site.js';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const documents = await getCollection('documents');

  const items = [...posts, ...documents]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      link: entry.data.legacyUrl,
      categories: [entry.collection === 'documents' ? 'Documents' : 'Actualités'],
    }));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items,
    customData: `<language>${SITE.lang}</language>`,
  });
}
