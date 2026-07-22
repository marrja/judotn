/**
 * Writes the two host-specific redirect files from src/redirects.json so the
 * Netlify and Vercel maps can never drift apart. Runs automatically on build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { redirects } = JSON.parse(fs.readFileSync(path.join(root, 'src/redirects.json'), 'utf8'));

// Netlify: splats are `/*` in both source and target.
const netlify = [
  '# Generated from src/redirects.json — do not edit by hand.',
  ...redirects.map((r) => `${r.from}  ${r.to}  301`),
  '',
].join('\n');
fs.writeFileSync(path.join(root, 'public/_redirects'), netlify);

// Vercel: wildcards use a named segment, not a bare splat.
const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  redirects: redirects.map((r) => ({
    source: r.from.replace('/*', '/:path*'),
    destination: r.to,
    permanent: true,
  })),
};
fs.writeFileSync(path.join(root, 'vercel.json'), JSON.stringify(vercel, null, 2) + '\n');

console.log(`redirects: wrote ${redirects.length} rules to public/_redirects and vercel.json`);
