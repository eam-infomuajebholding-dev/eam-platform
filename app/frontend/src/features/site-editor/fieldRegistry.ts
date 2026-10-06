import type { EditorFieldMeta, FieldType } from './types';

/**
 * Schema-first registry for named fields (Ctrl+K). Any page using `Layout` also supports
 * click-to-edit on img/video/text even without listing here — edits are scoped by URL path.
 */
export const EDITOR_FIELD_REGISTRY: EditorFieldMeta[] = [
  {
    id: 'home-hero-bg-image',
    label: 'صورة الهيرو — الشاشة الرئيسية',
    type: 'image',
    pages: ['/', '/services/platforms'],
    group: 'Home',
  },
  {
    id: 'home-about-eam-image',
    label: 'صورة القسم 2 — عن EAM',
    type: 'image',
    pages: ['/', '/services/platforms'],
    group: 'Home',
  },
  {
    id: 'home-one-statement-image',
    label: 'صورة القسم 3 — رسالة واحدة',
    type: 'image',
    pages: ['/', '/services/platforms'],
    group: 'Home',
  },
  {
    id: 'about-intro-text',
    label: 'مقدمة «من نحن»',
    type: 'markdown',
    pages: ['/about'],
    group: 'About',
  },
  {
    id: 'services-intro',
    label: 'مقدمة الخدمات',
    type: 'markdown',
    pages: ['/services'],
    group: 'Services',
  },
  {
    id: 'services-cta-title',
    label: 'عنوان دعوة الخدمات',
    type: 'plain',
    pages: ['/services'],
    group: 'Services',
  },
  {
    id: 'services-cta-desc',
    label: 'وصف دعوة الخدمات',
    type: 'markdown',
    pages: ['/services'],
    group: 'Services',
  },
];

export function resolveFieldMeta(fieldId: string, pagePath: string): EditorFieldMeta {
  const registered = EDITOR_FIELD_REGISTRY.find((f) => f.id === fieldId);
  if (registered) return registered;

  return {
    id: fieldId,
    label: fieldId,
    type: inferTypeFromId(fieldId),
    pages: [pagePath],
    group: 'Page',
  };
}

function inferTypeFromId(id: string): FieldType {
  if (/image|img|photo|thumb/i.test(id)) return 'image';
  if (/video|reel/i.test(id)) return 'video';
  if (/link|href|cta-url/i.test(id)) return 'link';
  if (/intro|body|desc|content|subtitle|paragraph/i.test(id)) return 'markdown';
  return 'plain';
}

export function listFieldsForPage(pagePath: string): EditorFieldMeta[] {
  const fromRegistry = EDITOR_FIELD_REGISTRY.filter(
    (f) => f.pages.includes('*') || f.pages.includes(pagePath),
  );

  const domIds = typeof document !== 'undefined'
    ? [...document.querySelectorAll('[data-editable-id]')]
        .map((el) => el.getAttribute('data-editable-id'))
        .filter((id): id is string => Boolean(id))
    : [];

  const merged = new Map<string, EditorFieldMeta>();
  for (const meta of fromRegistry) merged.set(meta.id, meta);
  for (const id of domIds) {
    if (!merged.has(id)) merged.set(id, resolveFieldMeta(id, pagePath));
  }
  return [...merged.values()];
}

export function listEditableDomIdsOnPage(): string[] {
  if (typeof document === 'undefined') return [];
  const ids = new Set<string>();
  for (const el of document.querySelectorAll('[data-editable-id]')) {
    const id = el.getAttribute('data-editable-id');
    if (id) ids.add(id);
  }
  return [...ids];
}
