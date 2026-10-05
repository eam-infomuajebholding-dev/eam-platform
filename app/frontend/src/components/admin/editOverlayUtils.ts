/** Shared helpers for inline site editing (dev mode). */

export function getStableKey(el: HTMLElement): string {
  const editableId =
    el.getAttribute('data-editable-id') ||
    el.closest('[data-editable-id]')?.getAttribute('data-editable-id');
  if (editableId) {
    return editableId;
  }

  const tag = el.tagName.toLowerCase();
  if (el.tagName === 'IMG') {
    const src = (el as HTMLImageElement).getAttribute('src') || '';
    const srcKey = src.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
    return `${tag}-${srcKey}`;
  }
  if (el.tagName === 'VIDEO') {
    const source = el.querySelector('source');
    const src = source?.getAttribute('src') || (el as HTMLVideoElement).getAttribute('src') || '';
    const srcKey = src.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
    return `${tag}-${srcKey}`;
  }
  const text = (el.textContent || '').trim().slice(0, 30).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
  return `${tag}-${text}`;
}

export type EditSurfaceKind = 'text' | 'link' | 'image' | 'video';

const TEXT_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'SPAN', 'A', 'LI', 'TD', 'TH', 'LABEL', 'BLOCKQUOTE',
]);

export function isInsideEditUI(el: HTMLElement): boolean {
  return !!el.closest('[data-edit-overlay]') || !!el.closest('[data-edit-toolbar]');
}

export function isImageElement(el: HTMLElement): boolean {
  return el.tagName === 'IMG';
}

export function isVideoElement(el: HTMLElement): boolean {
  return el.tagName === 'VIDEO';
}

export function isTextElement(el: HTMLElement): boolean {
  if (el.offsetHeight > 200 && el.tagName === 'DIV') return false;
  if (el.tagName === 'SECTION' || el.tagName === 'MAIN' || el.tagName === 'NAV' || el.tagName === 'FOOTER' || el.tagName === 'HEADER') {
    return false;
  }

  if (TEXT_TAGS.has(el.tagName)) {
    const text = el.textContent?.trim();
    return !!text && text.length > 0;
  }
  if (el.tagName === 'BUTTON' || el.tagName === 'DIV') {
    const text = el.textContent?.trim();
    return !!text && text.length > 0 && text.length < 500 && el.offsetHeight < 150;
  }
  return false;
}

export function resolveEditTarget(from: HTMLElement): { el: HTMLElement; kind: EditSurfaceKind } | null {
  let el: HTMLElement | null = from;
  while (el && el !== document.body) {
    if (isInsideEditUI(el)) return null;
    if (isImageElement(el)) return { el, kind: 'image' };
    if (isVideoElement(el)) return { el, kind: 'video' };
    if (el.tagName === 'A' && isTextElement(el)) return { el, kind: 'link' };
    if (isTextElement(el)) return { el, kind: 'text' };
    el = el.parentElement;
  }
  return null;
}

export function isEditableElement(el: HTMLElement): boolean {
  return isTextElement(el) || isImageElement(el) || isVideoElement(el);
}

export function kindLabelAr(kind: EditSurfaceKind): string {
  switch (kind) {
    case 'link':
      return 'رابط';
    case 'image':
      return 'صورة';
    case 'video':
      return 'فيديو';
    default:
      return 'نص';
  }
}
