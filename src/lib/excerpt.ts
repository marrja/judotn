/**
 * Derive a plain-text summary from a Markdown body — used as the meta
 * description when a post has no authored `excerpt`. Kept free of `astro:*`
 * imports so it runs under `node --test` (see scripts/test-excerpt.mjs).
 *
 * Takes the first real prose paragraph: headings, blockquotes, list items and
 * tables are skipped, inline Markdown is stripped, and the result is truncated
 * on a word boundary so a description never ends mid-word.
 */
export function excerptOf(body: string | undefined, maxLen = 160): string {
  if (!body) return '';
  for (const raw of body.split(/\n\s*\n/)) {
    const block = raw.trim();
    // Skip anything that is not a prose paragraph.
    if (!block || block.startsWith('#') || block.startsWith('>') || block.startsWith('|')) continue;
    if (/^[-*+]\s/.test(block) || /^\d+\.\s/.test(block)) continue;

    const text = block
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
      .replace(/[*_`~]/g, '') // emphasis / code marks
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;

    if (text.length <= maxLen) return text;
    // Cut at the last word boundary before the limit, then ellipsize.
    return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…';
  }
  return '';
}
