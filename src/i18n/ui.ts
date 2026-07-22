/**
 * Every user-facing string on the site, in the three published languages.
 *
 * French is the source of truth: `en` and `ar` are typed as
 * `Record<keyof typeof fr, string>`, so a missing translation is a type error
 * and `astro check` fails the build. There is no runtime "missing key" check
 * because there cannot be a missing key.
 *
 * TRANSLATION NOTE: the English and Arabic strings were authored during the
 * i18n migration, not supplied by the Fédération. They read correctly, but a
 * native speaker should review the Arabic before this goes to production —
 * the federation is publishing this wording under its own name.
 */

export const LOCALES = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

/** Written direction per locale, used for `<html dir>`. */
export const DIR: Record<Locale, 'ltr' | 'rtl'> = { fr: 'ltr', en: 'ltr', ar: 'rtl' };

/** BCP-47 tags for `lang`, `Intl`, hreflang and og:locale. */
export const BCP47: Record<Locale, string> = { fr: 'fr-TN', en: 'en', ar: 'ar-TN' };

/** Native language names, for the switcher. Always shown in their own script. */
export const LOCALE_NAMES: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

const fr = {
  // ── identity ────────────────────────────────────────────────
  'site.title': 'Fédération Tunisienne de Judo',
  'site.shortTitle': 'FTJUDO',
  'site.description':
    'Site officiel de la Fédération Tunisienne de Judo (FTJUDO) : actualités, ' +
    'documents officiels, règlements et informations sur le judo tunisien.',
  'site.tagline': 'Site officiel de la Fédération Tunisienne de Judo (FTJUDO)',
  'site.footerBlurb':
    'La Fédération Tunisienne de Judo encadre la pratique du judo et des disciplines associées ' +
    "sur l'ensemble du territoire tunisien.",

  // ── accessibility / chrome ──────────────────────────────────
  'a11y.skipLink': 'Aller au contenu principal',
  'a11y.navPrimary': 'Navigation principale',
  'a11y.navSecondary': 'Navigation secondaire',
  'a11y.breadcrumb': "Fil d'Ariane",
  'a11y.menu': 'Menu',
  'a11y.externalLink': '(site externe)',
  'a11y.langSwitcher': 'Choisir la langue',
  'a11y.mainSections': 'Sections principales',

  // ── navigation ──────────────────────────────────────────────
  'nav.home': 'Accueil',
  'nav.federation': 'La Fédération',
  'nav.technicalDirection': 'Direction Technique',
  'nav.activities': 'Activités',
  'nav.techniques': 'Techniques',
  'nav.clubs': 'Espace Clubs',
  'nav.documents': 'Documents',
  'nav.news': 'Actualités',
  'nav.contact': 'Contact',
  'nav.nationalTeams': 'Équipes Nationales',
  'nav.licences': 'Gestion des licences',
  'nav.statistics': 'Statistiques',
  'nav.results': 'Résultats',

  // ── external links ──────────────────────────────────────────
  'link.ijf': 'Fédération Internationale de Judo',
  'link.africaJudo': 'Union Africaine de Judo',
  'link.kodokan': 'Le Kodokan',
  'link.ijfAcademy': 'Académie de la FIJ',
  'link.ministry': 'Ministère de la Jeunesse et du Sport',
  'link.ioc': 'Comité Olympique International',
  'link.nocTunisia': 'Comité Olympique National Tunisien',
  'link.paralympicTunisia': 'Comité Paralympique Tunisien',
  'link.judoHistory': 'Histoire du judo',

  // ── home ────────────────────────────────────────────────────
  'home.eyebrow': 'Fédération Tunisienne de Judo',
  'home.titleTop': 'Le Judo',
  'home.titleBottom': "L'école de la vie",
  'home.lede': 'Huit valeurs. Une discipline. Une fédération au service du judo tunisien.',
  'home.codeMoral': 'Le code moral du judo',
  'home.viewAll': 'Tout voir',

  // ── news ────────────────────────────────────────────────────
  'news.title': 'Actualités',
  'news.description':
    'Toutes les actualités et annonces de la Fédération Tunisienne de Judo : compétitions, ' +
    'résultats, encadrement et communiqués officiels.',
  'news.intro': 'Compétitions, résultats, encadrement et communiqués de la Fédération.',
  'news.tagNews': 'Actualité',
  'news.tagAnnouncement': 'Annonce',

  // ── documents ───────────────────────────────────────────────
  'documents.title': 'Documents',
  'documents.description':
    "Statuts, code sportif, règlements d'arbitrage et de discipline : les textes officiels de " +
    'la Fédération Tunisienne de Judo, en téléchargement libre.',
  'documents.intro':
    'Statuts, code sportif et règlements de la Fédération Tunisienne de Judo. Tous les textes ' +
    'sont téléchargeables au format PDF.',
  'documents.download': 'Télécharger le PDF',
  'documents.hint':
    "Le document s'ouvre dans le lecteur PDF de votre navigateur ou de votre appareil.",
  'documents.showPreview': "Afficher l'aperçu",
  'documents.previewOf': 'Aperçu de',
  'documents.previewFallbackBefore': 'Votre navigateur ne peut pas afficher ce PDF.',
  'documents.previewFallbackLink': 'Téléchargez-le',
  /** Shown on the English and Arabic builds: the PDFs themselves are French. */
  'documents.frenchOnly': 'Ce document officiel est publié en français uniquement.',

  // ── contact ─────────────────────────────────────────────────
  'contact.title': 'Contact',
  'contact.description':
    'Contacter la Fédération Tunisienne de Judo : adresse, téléphone et courriel de la fédération.',
  'contact.intro':
    "Pour toute question relative aux licences, aux compétitions ou à l'affiliation d'un club.",
  'contact.details': 'Coordonnées',
  'contact.onlineServices': 'Services en ligne',
  'contact.onlineBlurb':
    'La gestion des licences, les statistiques et les résultats sont hébergés sur le portail ' +
    'sportif de la Fédération.',
  'contact.address': 'Adresse',
  'contact.phone': 'Téléphone',
  'contact.email': 'E-mail',
  'contact.toComplete': 'À compléter',

  // ── footer ──────────────────────────────────────────────────
  'footer.federation': 'La Fédération',
  'footer.usefulLinks': 'Liens utiles',
  'footer.olympism': "L'Olympisme",
  'footer.rss': 'Flux RSS',

  // ── 404 ─────────────────────────────────────────────────────
  'notFound.eyebrow': 'Erreur 404',
  'notFound.title': 'Page introuvable',
  'notFound.description': "La page demandée n'existe pas ou a été déplacée.",
  'notFound.lede': "Cette page n'existe pas ou a été déplacée lors de la refonte du site.",
  'notFound.home': "Retour à l'accueil",

  // ── file size units (decimal, as browsers show them) ────────
  'unit.bytes': 'o',
  'unit.kilobytes': 'ko',
  'unit.megabytes': 'Mo',
} as const;

type UIKey = keyof typeof fr;

const en: Record<UIKey, string> = {
  'site.title': 'Tunisian Judo Federation',
  'site.shortTitle': 'FTJUDO',
  'site.description':
    'Official website of the Tunisian Judo Federation (FTJUDO): news, official documents, ' +
    'regulations and information about Tunisian judo.',
  'site.tagline': 'Official website of the Tunisian Judo Federation (FTJUDO)',
  'site.footerBlurb':
    'The Tunisian Judo Federation governs the practice of judo and its associated disciplines ' +
    'throughout Tunisia.',

  'a11y.skipLink': 'Skip to main content',
  'a11y.navPrimary': 'Main navigation',
  'a11y.navSecondary': 'Secondary navigation',
  'a11y.breadcrumb': 'Breadcrumb',
  'a11y.menu': 'Menu',
  'a11y.externalLink': '(external site)',
  'a11y.langSwitcher': 'Choose a language',
  'a11y.mainSections': 'Main sections',

  'nav.home': 'Home',
  'nav.federation': 'The Federation',
  'nav.technicalDirection': 'Technical Directorate',
  'nav.activities': 'Activities',
  'nav.techniques': 'Techniques',
  'nav.clubs': 'Clubs',
  'nav.documents': 'Documents',
  'nav.news': 'News',
  'nav.contact': 'Contact',
  'nav.nationalTeams': 'National Teams',
  'nav.licences': 'Licence management',
  'nav.statistics': 'Statistics',
  'nav.results': 'Results',

  'link.ijf': 'International Judo Federation',
  'link.africaJudo': 'African Judo Union',
  'link.kodokan': 'The Kodokan',
  'link.ijfAcademy': 'IJF Academy',
  'link.ministry': 'Ministry of Youth and Sports',
  'link.ioc': 'International Olympic Committee',
  'link.nocTunisia': 'Tunisian National Olympic Committee',
  'link.paralympicTunisia': 'Tunisian Paralympic Committee',
  'link.judoHistory': 'History of judo',

  'home.eyebrow': 'Tunisian Judo Federation',
  'home.titleTop': 'Judo',
  'home.titleBottom': 'The school of life',
  'home.lede': 'Eight values. One discipline. A federation in the service of Tunisian judo.',
  'home.codeMoral': 'The moral code of judo',
  'home.viewAll': 'View all',

  'news.title': 'News',
  'news.description':
    'All news and announcements from the Tunisian Judo Federation: competitions, results, ' +
    'coaching and official statements.',
  'news.intro': 'Competitions, results, coaching and statements from the Federation.',
  'news.tagNews': 'News',
  'news.tagAnnouncement': 'Announcement',

  'documents.title': 'Documents',
  'documents.description':
    'Statutes, sporting code, refereeing and disciplinary regulations: the official texts of ' +
    'the Tunisian Judo Federation, free to download.',
  'documents.intro':
    'Statutes, sporting code and regulations of the Tunisian Judo Federation. Every text is ' +
    'available to download as a PDF.',
  'documents.download': 'Download the PDF',
  'documents.hint': "The document opens in your browser's or device's PDF reader.",
  'documents.showPreview': 'Show preview',
  'documents.previewOf': 'Preview of',
  'documents.previewFallbackBefore': 'Your browser cannot display this PDF.',
  'documents.previewFallbackLink': 'Download it',
  'documents.frenchOnly': 'This official document is published in French only.',

  'contact.title': 'Contact',
  'contact.description':
    'Contact the Tunisian Judo Federation: address, telephone and email of the federation.',
  'contact.intro': 'For any question about licences, competitions or affiliating a club.',
  'contact.details': 'Contact details',
  'contact.onlineServices': 'Online services',
  'contact.onlineBlurb':
    "Licence management, statistics and results are hosted on the Federation's sports portal.",
  'contact.address': 'Address',
  'contact.phone': 'Telephone',
  'contact.email': 'Email',
  'contact.toComplete': 'To be completed',

  'footer.federation': 'The Federation',
  'footer.usefulLinks': 'Useful links',
  'footer.olympism': 'Olympism',
  'footer.rss': 'RSS feed',

  'notFound.eyebrow': 'Error 404',
  'notFound.title': 'Page not found',
  'notFound.description': 'The requested page does not exist or has been moved.',
  'notFound.lede': 'This page does not exist or was moved when the site was rebuilt.',
  'notFound.home': 'Back to the home page',

  'unit.bytes': 'B',
  'unit.kilobytes': 'kB',
  'unit.megabytes': 'MB',
};

const ar: Record<UIKey, string> = {
  'site.title': 'الجامعة التونسية للجودو',
  'site.shortTitle': 'FTJUDO',
  'site.description':
    'الموقع الرسمي للجامعة التونسية للجودو: الأخبار والوثائق الرسمية والتراتيب ' +
    'والمعلومات المتعلقة بالجودو التونسي.',
  'site.tagline': 'الموقع الرسمي للجامعة التونسية للجودو',
  'site.footerBlurb':
    'تشرف الجامعة التونسية للجودو على ممارسة رياضة الجودو والاختصاصات المرتبطة بها ' +
    'في كامل تراب الجمهورية التونسية.',

  'a11y.skipLink': 'الانتقال إلى المحتوى الرئيسي',
  'a11y.navPrimary': 'التنقل الرئيسي',
  'a11y.navSecondary': 'التنقل الثانوي',
  'a11y.breadcrumb': 'مسار التصفح',
  'a11y.menu': 'القائمة',
  'a11y.externalLink': '(موقع خارجي)',
  'a11y.langSwitcher': 'اختيار اللغة',
  'a11y.mainSections': 'الأقسام الرئيسية',

  'nav.home': 'الرئيسية',
  'nav.federation': 'الجامعة',
  'nav.technicalDirection': 'الإدارة الفنية',
  'nav.activities': 'الأنشطة',
  'nav.techniques': 'التقنيات',
  'nav.clubs': 'فضاء النوادي',
  'nav.documents': 'الوثائق',
  'nav.news': 'الأخبار',
  'nav.contact': 'اتصل بنا',
  'nav.nationalTeams': 'المنتخبات الوطنية',
  'nav.licences': 'إدارة الإجازات',
  'nav.statistics': 'الإحصائيات',
  'nav.results': 'النتائج',

  'link.ijf': 'الاتحاد الدولي للجودو',
  'link.africaJudo': 'الاتحاد الإفريقي للجودو',
  'link.kodokan': 'الكودوكان',
  'link.ijfAcademy': 'أكاديمية الاتحاد الدولي للجودو',
  'link.ministry': 'وزارة الشباب والرياضة',
  'link.ioc': 'اللجنة الأولمبية الدولية',
  'link.nocTunisia': 'اللجنة الوطنية الأولمبية التونسية',
  'link.paralympicTunisia': 'اللجنة البارالمبية التونسية',
  'link.judoHistory': 'تاريخ الجودو',

  'home.eyebrow': 'الجامعة التونسية للجودو',
  'home.titleTop': 'الجودو',
  'home.titleBottom': 'مدرسة الحياة',
  'home.lede': 'ثماني قيم. رياضة واحدة. جامعة في خدمة الجودو التونسي.',
  'home.codeMoral': 'القانون الأخلاقي للجودو',
  'home.viewAll': 'عرض الكل',

  'news.title': 'الأخبار',
  'news.description':
    'كل أخبار وبلاغات الجامعة التونسية للجودو: المنافسات والنتائج والتأطير والبلاغات الرسمية.',
  'news.intro': 'المنافسات والنتائج والتأطير وبلاغات الجامعة.',
  'news.tagNews': 'خبر',
  'news.tagAnnouncement': 'بلاغ',

  'documents.title': 'الوثائق',
  'documents.description':
    'القانون الأساسي والمجلة الرياضية وتراتيب التحكيم والتأديب: النصوص الرسمية ' +
    'للجامعة التونسية للجودو، متاحة للتحميل.',
  'documents.intro':
    'القانون الأساسي والمجلة الرياضية وتراتيب الجامعة التونسية للجودو. ' +
    'كل النصوص متاحة للتحميل بصيغة PDF.',
  'documents.download': 'تحميل ملف PDF',
  'documents.hint': 'يُفتح الملف في قارئ PDF الخاص بمتصفحك أو بجهازك.',
  'documents.showPreview': 'عرض المعاينة',
  'documents.previewOf': 'معاينة',
  'documents.previewFallbackBefore': 'لا يمكن لمتصفحك عرض هذا الملف.',
  'documents.previewFallbackLink': 'حمّله',
  'documents.frenchOnly': 'هذه الوثيقة الرسمية منشورة باللغة الفرنسية فقط.',

  'contact.title': 'اتصل بنا',
  'contact.description': 'الاتصال بالجامعة التونسية للجودو: العنوان والهاتف والبريد الإلكتروني.',
  'contact.intro': 'لكل سؤال يتعلق بالإجازات أو المنافسات أو انخراط النوادي.',
  'contact.details': 'معطيات الاتصال',
  'contact.onlineServices': 'الخدمات عن بُعد',
  'contact.onlineBlurb': 'إدارة الإجازات والإحصائيات والنتائج متوفرة على البوابة الرياضية للجامعة.',
  'contact.address': 'العنوان',
  'contact.phone': 'الهاتف',
  'contact.email': 'البريد الإلكتروني',
  'contact.toComplete': 'في انتظار الاستكمال',

  'footer.federation': 'الجامعة',
  'footer.usefulLinks': 'روابط مفيدة',
  'footer.olympism': 'الحركة الأولمبية',
  'footer.rss': 'تدفق RSS',

  'notFound.eyebrow': 'خطأ 404',
  'notFound.title': 'الصفحة غير موجودة',
  'notFound.description': 'الصفحة المطلوبة غير موجودة أو تم نقلها.',
  'notFound.lede': 'هذه الصفحة غير موجودة أو تم نقلها عند إعادة بناء الموقع.',
  'notFound.home': 'العودة إلى الصفحة الرئيسية',

  'unit.bytes': 'بايت',
  'unit.kilobytes': 'كيلوبايت',
  'unit.megabytes': 'ميغابايت',
};

export const ui = { fr, en, ar } as const satisfies Record<Locale, Record<UIKey, string>>;

/**
 * The eight values of the code moral du judo, in their traditional order.
 * An array rather than numbered keys because the order is the content.
 */
export const codeMoral: Record<Locale, readonly string[]> = {
  fr: [
    'La politesse',
    'Le courage',
    'La sincérité',
    "L'honneur",
    'La modestie',
    'Le respect',
    'Le contrôle de soi',
    "L'amitié",
  ],
  en: [
    'Politeness',
    'Courage',
    'Sincerity',
    'Honour',
    'Modesty',
    'Respect',
    'Self-control',
    'Friendship',
  ],
  ar: ['الأدب', 'الشجاعة', 'الصدق', 'الشرف', 'التواضع', 'الاحترام', 'ضبط النفس', 'الصداقة'],
};
