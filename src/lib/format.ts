import { SITE } from '../site.js';

const dateFmt = new Intl.DateTimeFormat(`${SITE.lang}-TN`, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "25 juin 2024" — UTC-pinned so the build is reproducible across machines. */
export const formatDate = (d: Date): string => dateFmt.format(d);

/**
 * Human file size for download links. Uses MB/kB decimal units, which is what
 * browsers and file managers show, and keeps one decimal below 10 MB.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} o`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} ko`;
  const mb = bytes / 1_000_000;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} Mo`;
}
