// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { SITE } from './src/site.js';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',

  /**
   * Each language is served under its own prefix — /fr/, /en/, /ar/. The bare
   * root / is a browser-language detector (src/pages/index.astro) that
   * redirects into one of them, so `redirectToDefaultLocale` is off: Astro must
   * not inject its own unconditional root→/fr redirect over that page. Old
   * un-prefixed WordPress permalinks 301 to their /fr/ equivalent via .htaccess.
   */
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'ar'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },

  integrations: [
    sitemap({
      // The 404 and the root language gate are both excluded: the gate is a
      // noindex redirector, and the three language homes carry the hreflang.
      // `page` is the absolute URL, so the gate is exactly `${SITE.url}/`.
      filter: (page) =>
        !page.endsWith('/404') && !page.endsWith('/llms.txt') && page !== `${SITE.url}/`,
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
