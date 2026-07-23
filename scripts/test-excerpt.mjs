/**
 * Unit tests for the Markdown -> meta-description derivation — the one piece of
 * non-trivial parsing the SEO work adds. Run with `npm run test:unit`.
 *
 * No framework: node's own test runner, and the module under test is imported
 * straight from source via node type stripping (same pattern as test-i18n.mjs).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { excerptOf } from '../src/lib/excerpt.ts';

test('takes the first prose paragraph', () => {
  assert.equal(excerptOf('First paragraph here.\n\nSecond one.'), 'First paragraph here.');
});

test('skips a leading heading', () => {
  assert.equal(excerptOf('## Titre\n\nLe vrai texte.'), 'Le vrai texte.');
});

test('skips leading lists and blockquotes, then finds prose', () => {
  assert.equal(excerptOf('- a\n- b\n\n> quote\n\nProse arrives.'), 'Prose arrives.');
});

test('strips bold, links and inline code', () => {
  assert.equal(
    excerptOf('La **délégation** se rend au [Maroc](https://x) pour le `championnat`.'),
    'La délégation se rend au Maroc pour le championnat.',
  );
});

test('collapses whitespace across wrapped lines', () => {
  assert.equal(excerptOf('one\ntwo\nthree'), 'one two three');
});

test('truncates on a word boundary and ellipsizes', () => {
  const long = 'mot '.repeat(60).trim(); // all complete 3-letter words
  const out = excerptOf(long, 40);
  assert.ok(out.length <= 40, `length ${out.length} should be <= 40`);
  assert.ok(out.endsWith('…'), 'should end with an ellipsis');
  // Every token before the ellipsis is a whole "mot" — a mid-word cut would
  // leave "mo" or "m" and fail this.
  const words = out.slice(0, -1).trim().split(/\s+/);
  assert.ok(
    words.every((w) => w === 'mot'),
    `left a partial word: ${out}`,
  );
});

test('returns empty for undefined or heading-only bodies', () => {
  assert.equal(excerptOf(undefined), '');
  assert.equal(excerptOf('# only a heading'), '');
  assert.equal(excerptOf(''), '');
});

test('an image-only paragraph is skipped in favour of real prose', () => {
  assert.equal(excerptOf('![alt](/cover.webp)\n\nCaption text.'), 'Caption text.');
});
