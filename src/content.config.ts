import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * `legacyUrl` is the URL WordPress served this entry at. It is the routing
 * key, not decoration — the post routes build straight from it so the
 * original /YYYY/MM/DD/slug/ permalinks survive the migration.
 */
const legacy = {
  legacySlug: z.string(),
  legacyUrl: z.string().startsWith('/').endsWith('/'),
};

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      date: z.coerce.date(),
      category: z.enum(['actualites', 'annonces']),
      cover: image().optional(),
      coverAlt: z.string().default(''),
      tags: z.array(z.string()).default([]),
      ...legacy,
    }),
});

const documents = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/documents' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    pdf: z.string().startsWith('/documents/'),
    pdfBytes: z.number().int().positive(),
    ...legacy,
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
