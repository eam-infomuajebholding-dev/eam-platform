export type SectionPublishState = 'published' | 'hidden';

export type PageSectionDefinition = {
  id: string;
  label: string;
  /** When no DB record exists */
  defaultState?: SectionPublishState;
};

/** Stable ids — must match `data-page-section` / `data-home-section` on components. */
export const PAGE_SECTION_REGISTRY: Record<string, PageSectionDefinition[]> = {
  '/': [
    { id: 'first-viewport', label: 'البطل + مساحة العمل' },
    { id: 'about-eam', label: 'عن EAM' },
    { id: 'one-statement', label: 'رسالة واحدة' },
    { id: 'what-we-offer', label: 'ماذا نقدم' },
    { id: 'sector-platforms', label: 'منصة القطاعات' },
    { id: 'mid-content', label: 'محتوى وسط الصفحة' },
    { id: 'projects-showcase', label: 'عرض المشاريع' },
    { id: 'investment', label: 'الاستثمار' },
    { id: 'contact', label: 'تواصل / CTA' },
    { id: 'solutions', label: 'الحلول' },
    { id: 'why-eam', label: 'لماذا EAM' },
    { id: 'platforms-grid', label: 'شبكة المنصات' },
  ],
  '/about': [
    { id: 'hero', label: 'البطل' },
    { id: 'stats', label: 'إحصائيات' },
    { id: 'intro', label: 'نبذة والالتزامات' },
    { id: 'values', label: 'قيمنا' },
  ],
  '/services': [
    { id: 'hero', label: 'البطل' },
    { id: 'platforms-intro', label: 'منصة القطاعات — مقدمة' },
    { id: 'engineering', label: 'خدمات الهندسة' },
    { id: 'government', label: 'الخدمات الحكومية' },
    { id: 'cta', label: 'دعوة للإجراء' },
  ],
  '/projects': [
    { id: 'hero', label: 'البطل' },
    { id: 'portfolio', label: 'معرض المشاريع' },
  ],
  '/contact': [
    { id: 'hero', label: 'البطل' },
    { id: 'form', label: 'نموذج التواصل' },
    { id: 'channels', label: 'قنوات التواصل' },
  ],
  '/invest': [
    { id: 'hero', label: 'البطل' },
    { id: 'stats', label: 'إحصائيات' },
    { id: 'projects', label: 'فرص الاستثمار' },
    { id: 'cta', label: 'دعوة للإجراء' },
  ],
};

const SERVICE_PAGE_SECTIONS: PageSectionDefinition[] = [
  { id: 'hero', label: 'البطل' },
  { id: 'services-grid', label: 'شبكة الخدمات' },
  { id: 'cta', label: 'دعوة للإجراء' },
];

const SIMPLE_PAGE_SECTIONS: PageSectionDefinition[] = [
  { id: 'hero', label: 'البطل' },
  { id: 'main', label: 'المحتوى الرئيسي' },
];

/** Routes that share the homepage section stack use one visibility namespace. */
export function pageKeyForSectionVisibility(pathname: string): string {
  if (pathname === '/services/platforms') {
    return '/';
  }
  return pathname;
}

function registryForPath(key: string): PageSectionDefinition[] {
  if (PAGE_SECTION_REGISTRY[key]) {
    return PAGE_SECTION_REGISTRY[key];
  }
  const servicePaths = [
    '/engineering-services',
    '/government-services',
    '/services/contracting',
    '/services/maintenance',
    '/services/real-estate-development',
    '/services/real-estate-marketing',
  ];
  if (servicePaths.includes(key)) {
    return SERVICE_PAGE_SECTIONS;
  }
  const simplePaths = ['/team', '/careers', '/market', '/consultation', '/blog'];
  if (simplePaths.includes(key)) {
    return SIMPLE_PAGE_SECTIONS;
  }
  if (key.startsWith('/sectors/')) {
    return [
      { id: 'hero', label: 'البطل' },
      { id: 'stats', label: 'إحصائيات' },
      { id: 'journey', label: 'ابدأ الرحلة' },
    ];
  }
  return [];
}

export function sectionsForPage(path: string): PageSectionDefinition[] {
  const key = pageKeyForSectionVisibility(path);
  return registryForPath(key);
}

export function sectionStorageKey(sectionId: string): string {
  return `section:${sectionId}`;
}

export function parseSectionStorageKey(elementKey: string): string | null {
  return elementKey.startsWith('section:') ? elementKey.slice('section:'.length) : null;
}
