// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { SITE } from './src/site.js';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',

  /**
   * French is the default locale and is served WITHOUT a prefix. That is not a
   * preference: every WordPress permalink this site inherited is a French URL
   * at the root (/2024/06/25/slug/), and verify-build.mjs fails the build if
   * one stops resolving. English and Arabic sit behind /en/ and /ar/.
   */
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404'),
      // Emits <xhtml:link rel="alternate" hreflang> for all three languages.
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-TN', en: 'en', ar: 'ar-TN' },
      },
    }),
  ],
  build: {
    // WordPress served every URL with a trailing slash; keep the same shape
    // so the redirect map stays a straight 1:1 and no link 301-hops.
    format: 'directory',
  },
  image: {
    responsiveStyles: true,
  },
});
