/**
 * Unit tests for the locale helpers — the only non-trivial pure logic the i18n
 * work adds. Everything else (missing translation keys, built routes, hreflang)
 * is caught by `astro check` or by verify-build.mjs against real output.
 *
 * Run with `npm test`. No framework: node's own test runner, and the module
 * under test is imported straight from source via node type stripping.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCALES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  alternates,
  codeMoral,
  formatBytes,
  formatDate,
  langParam,
  localeFromParam,
  localeParams,
  localePath,
  stripLocale,
  useTranslations,
} from '../src/i18n/index.ts';
import { ui } from '../src/i18n/ui.ts';
import { DETECT_LOCALES, DETECT_FALLBACK, pickLocale } from '../src/i18n/detect.ts';

test('every language is served under its own prefix, including French', () => {
  assert.equal(localePath('fr', '/2024/06/25/statut-ftjudo/'), '/fr/2024/06/25/statut-ftjudo/');
  assert.equal(localePath('en', '/documents/'), '/en/documents/');
  assert.equal(localePath('ar', '/documents/'), '/ar/documents/');
  assert.equal(localePath('fr', '/'), '/fr/');
  assert.equal(localePath('en', '/'), '/en/');
  assert.equal(localePath('ar', '/'), '/ar/');
});

test('langParam is the locale itself (all locales are prefixed)', () => {
  assert.equal(langParam('fr'), 'fr');
  assert.equal(langParam('en'), 'en');
  assert.equal(langParam('ar'), 'ar');
});

test('localePath tolerates a path with no leading slash', () => {
  assert.equal(localePath('en', 'documents/'), '/en/documents/');
});

test('stripLocale is the exact inverse of localePath, for every locale', () => {
  for (const lang of LOCALES) {
    for (const path of ['/', '/documents/', '/2024/06/25/slug/', '/actualites/']) {
      const built = localePath(lang, path);
      assert.deepEqual(stripLocale(built), { lang, path }, `${lang} ${path}`);
    }
  }
});

test('stripLocale on a non-prefixed path reports the fallback and leaves it unchanged', () => {
  // Only the root gate, robots and the 404 are un-prefixed; none route by this.
  assert.deepEqual(stripLocale('/404/'), { lang: FALLBACK_LOCALE, path: '/404/' });
  assert.deepEqual(stripLocale('/'), { lang: FALLBACK_LOCALE, path: '/' });
});

test('alternates gives all three locales from any locale of the same page', () => {
  const fromFr = alternates('/fr/documents/');
  const fromAr = alternates('/ar/documents/');
  assert.deepEqual(fromFr, fromAr, 'hreflang set must not depend on the current locale');
  assert.deepEqual(
    fromFr.map((a) => a.href),
    ['/fr/documents/', '/en/documents/', '/ar/documents/'],
  );
  assert.equal(fromFr.find((a) => a.lang === 'ar')?.dir, 'rtl');
});

test('localeParams produces the getStaticPaths fan-out for all three prefixes', () => {
  assert.deepEqual(localeParams(), [
    { params: { lang: 'fr' } },
    { params: { lang: 'en' } },
    { params: { lang: 'ar' } },
  ]);
});

test('localeFromParam falls back to English for anything unrecognised', () => {
  assert.equal(localeFromParam('fr'), 'fr');
  assert.equal(localeFromParam('en'), 'en');
  assert.equal(localeFromParam('ar'), 'ar');
  assert.equal(localeFromParam(undefined), FALLBACK_LOCALE);
  assert.equal(localeFromParam('de'), FALLBACK_LOCALE);
});

test('the two default concepts are what the routing expects', () => {
  assert.equal(DEFAULT_LOCALE, 'fr'); // source/content language
  assert.equal(FALLBACK_LOCALE, 'en'); // browser-miss + x-default
});

test('pickLocale matches on the base subtag and falls back to English', () => {
  assert.equal(pickLocale(['fr-FR', 'fr', 'en-US']), 'fr');
  assert.equal(pickLocale(['en-GB']), 'en');
  assert.equal(pickLocale(['ar-TN', 'ar']), 'ar');
  assert.equal(pickLocale(['AR']), 'ar', 'case-insensitive');
  // First matching preference wins, even if a later one also matches.
  assert.equal(pickLocale(['de-DE', 'ar', 'fr']), 'ar');
  // No published language among the preferences → fallback.
  assert.equal(pickLocale(['de', 'es', 'it']), 'en');
  assert.equal(pickLocale([]), 'en');
  assert.equal(pickLocale(undefined), 'en');
});

test('the detector locale set never drifts from the app locale set', () => {
  // detect.ts duplicates the locale list to stay DOM-free and tiny; this keeps
  // the copy honest.
  assert.deepEqual([...DETECT_LOCALES].sort(), [...LOCALES].sort());
  assert.equal(DETECT_FALLBACK, FALLBACK_LOCALE);
});

test('dates use Tunisian month names in Arabic, not the Mashriq set', () => {
  const d = new Date('2026-07-21T00:00:00Z');
  assert.equal(formatDate('fr', d), '21 juillet 2026');
  assert.equal(formatDate('ar', d), '21 جويلية 2026');
  assert.ok(!formatDate('ar', d).includes('يوليو'), 'ar-TN must not fall back to generic Arabic');
});

test('English dates are day-first, matching the other two languages', () => {
  assert.equal(formatDate('en', new Date('2026-07-21T00:00:00Z')), '21 July 2026');
});

test('dates are UTC-pinned so the build is reproducible', () => {
  // 23:30 UTC would roll into the next day in any positive-offset zone.
  assert.equal(formatDate('fr', new Date('2024-06-25T23:30:00Z')), '25 juin 2024');
});

test('file sizes use each language units and keep one decimal below 10 MB', () => {
  assert.equal(formatBytes('fr', 512), '512 o');
  assert.equal(formatBytes('en', 512), '512 B');
  assert.equal(formatBytes('ar', 512), '512 بايت');
  assert.equal(formatBytes('fr', 250_000), '250 ko');
  assert.equal(formatBytes('fr', 2_400_000), '2.4 Mo');
  assert.equal(formatBytes('en', 2_400_000), '2.4 MB');
  assert.equal(formatBytes('fr', 12_000_000), '12 Mo');
});

test('every locale defines every UI key', () => {
  const keys = Object.keys(ui.fr);
  for (const lang of LOCALES) {
    assert.deepEqual(Object.keys(ui[lang]).sort(), [...keys].sort(), `${lang} key set`);
    for (const k of keys) {
      assert.ok(ui[lang][k]?.trim(), `${lang}.${k} is empty`);
    }
  }
});

test('non-French locales are actually translated, not copied French', () => {
  // Guards against a half-finished translation pass silently shipping French
  // strings under an English or Arabic hreflang.
  //
  // The exceptions are true French/English cognates spelled identically in
  // both languages, plus the brand mark. Listed key by key rather than as a
  // blanket skip, so a genuinely untranslated string still fails.
  const cognates = {
    en: new Set([
      'site.shortTitle', // FTJUDO — brand mark
      'a11y.menu', // "Menu"
      'nav.techniques', // "Techniques"
      'nav.documents', // "Documents"
      'nav.contact', // "Contact"
      'documents.title', // "Documents"
      'contact.title', // "Contact"
    ]),
    ar: new Set(['site.shortTitle']),
  };
  for (const lang of ['en', 'ar']) {
    for (const k of Object.keys(ui.fr)) {
      if (cognates[lang].has(k)) continue;
      assert.notEqual(ui[lang][k], ui.fr[k], `${lang}.${k} is still the French string`);
    }
  }
});

test('Arabic UI strings contain Arabic script', () => {
  const arabic = /[؀-ۿ]/;
  for (const [k, v] of Object.entries(ui.ar)) {
    if (k === 'site.shortTitle' || k === 'footer.rss') continue; // brand marks
    assert.ok(arabic.test(v), `ar.${k} has no Arabic characters: ${v}`);
  }
});

test('the code moral keeps its eight values and traditional order in every language', () => {
  const translations = useTranslations('fr');
  assert.equal(typeof translations('home.codeMoral'), 'string');
  for (const lang of LOCALES) {
    assert.equal(codeMoral[lang].length, 8, `${lang} must have all eight values`);
    assert.equal(new Set(codeMoral[lang]).size, 8, `${lang} has a duplicated value`);
  }
});

test('useTranslations returns the right language', () => {
  assert.equal(useTranslations('fr')('nav.news'), 'Actualités');
  assert.equal(useTranslations('en')('nav.news'), 'News');
  assert.equal(useTranslations('ar')('nav.news'), 'الأخبار');
});
