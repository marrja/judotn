// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { SITE } from './src/site.js';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  // The site is French-only — no i18n routing, so no hreflang alternates.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') })],
  build: {
    // WordPress served every URL with a trailing slash; keep the same shape
    // so the redirect map stays a straight 1:1 and no link 301-hops.
    format: 'directory',
  },
  image: {
    responsiveStyles: true,
  },
});
