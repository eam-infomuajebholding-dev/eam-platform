export type SectionPublishState = 'published' | 'hidden';

export type PageSectionDefinition = {
  id: string;
  label: string;
  /** When no DB record exists */
  defaultState?: SectionPublishState;
};

/** Stable ids — must match `data-home-section` on components. */
export const PAGE_SECTION_REGISTRY: Record<string, PageSectionDefinition[]> = {
  '/': [
    { id: 'first-viewport', label: 'البطل + مساحة العمل' },
    { id: 'about-eam', label: 'عن EAM' },
    { id: 'one-statement', label: 'رسالة واحدة' },
    { id: 'what-we-offer', label: 'ماذا نقدم' },
    { id: 'mid-content', label: 'محتوى وسط الصفحة' },
    { id: 'projects-showcase', label: 'عرض المشاريع' },
    { id: 'investment', label: 'الاستثمار' },
    { id: 'contact', label: 'تواصل / CTA' },
  ],
};

export function sectionsForPage(path: string): PageSectionDefinition[] {
  return PAGE_SECTION_REGISTRY[path] ?? [];
}

export function sectionStorageKey(sectionId: string): string {
  return `section:${sectionId}`;
}

export function parseSectionStorageKey(elementKey: string): string | null {
  return elementKey.startsWith('section:') ? elementKey.slice('section:'.length) : null;
}
