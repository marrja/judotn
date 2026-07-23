import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Every collection is split one directory per locale — `posts/fr/x.md`,
 * `posts/en/x.md`, `posts/ar/x.md` — so an entry's `id` is `<locale>/<key>`.
 *
 * The filename IS the translation key: the three files that share a name are
 * the same entry in three languages, which is all the language switcher needs.
 * There is deliberately no `translationKey` field to keep in sync.
 *
 * Do NOT add a `slug` field to any frontmatter here. Astro's glob loader treats
 * `slug` as an override for the generated `id`, which would collapse all three
 * locales of an entry onto a single id and silently break the split above.
 */

/**
 * `url` is the canonical French path this entry is served at, and it is the
 * routing key rather than decoration: the post route builds straight from it,
 * so the original WordPress permalinks survive and a filename can never drift
 * away from its published address. The other locales are this same path behind
 * an `/en/` or `/ar/` prefix.
 */
const routed = {
  url: z.string().startsWith('/').endsWith('/'),
};

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      date: z.coerce.date(),
      category: z.enum(['actualites', 'annonces']),
      // Optional authored summary. When absent, the post route derives one from
      // the first paragraph of the body rather than repeating the title.
      excerpt: z.string().optional(),
      cover: image().optional(),
      coverAlt: z.string().default(''),
      tags: z.array(z.string()).default([]),
      ...routed,
    }),
});

const documents = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/documents' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    pdf: z.string().startsWith('/documents/'),
    pdfBytes: z.number().int().positive(),
    ...routed,
  }),
});

/**
 * Editorial pages that are prose, not records. Kept as a collection so adding
 * one is a Markdown file rather than an .astro file.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().default(99),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, documents, pages };
