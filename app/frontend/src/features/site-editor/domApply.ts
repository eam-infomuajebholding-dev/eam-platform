import Markdown from 'markdown-to-jsx';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { getStableKey } from '@/components/admin/editOverlayUtils';
import { getMediaFromIDB } from '@/lib/mediaStorage';
import { getHomeImage } from '@/config/assets';
import { applyLayoutToElement, readLayoutFromElement, resetEditorTransformsOnElement } from './layoutUtils';
import { parseStoredValue } from './serialization';
import type { FieldValue } from './types';

const markdownRoots = new WeakMap<HTMLElement, Root>();

function readDefaultMediaSrc(el: HTMLElement): string | null {
  return el.getAttribute('data-editor-default-src');
}

function applyMediaUrl(el: HTMLImageElement | HTMLVideoElement, value: string) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    const fallback = readDefaultMediaSrc(el);
    if (fallback) {
      if (el.tagName === 'IMG') {
        (el as HTMLImageElement).src = fallback;
      }
    }
    return;
  }

  const setSrc = (url: string) => {
    if (el.tagName === 'IMG') {
      (el as HTMLImageElement).src = url;
      return;
    }
    const video = el as HTMLVideoElement;
    const source = video.querySelector('source');
    if (source) source.src = url;
    else video.src = url;
    video.load();
  };

  if (trimmed.startsWith('idb://')) {
    const idbKey = trimmed.replace('idb://', '');
    void getMediaFromIDB(idbKey).then((dataUrl) => {
      if (dataUrl) setSrc(dataUrl);
    });
    return;
  }
  setSrc(trimmed);
}

function layoutFromEl(el: HTMLElement) {
  return readLayoutFromElement(el);
}

export function readValueFromElement(el: HTMLElement, type: FieldValue['type']): FieldValue {
  const layout = layoutFromEl(el);
  if (type === 'image' && el.tagName === 'IMG') {
    return { type: 'image', url: (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src, layout };
  }
  if (type === 'video' && el.tagName === 'VIDEO') {
    const video = el as HTMLVideoElement;
    const src = video.querySelector('source')?.getAttribute('src') ?? video.src;
    return { type: 'video', url: src, layout };
  }
  if (type === 'link' && el.tagName === 'A') {
    const anchor = el as HTMLAnchorElement;
    return {
      type: 'link',
      text: anchor.textContent?.trim() ?? '',
      href: anchor.getAttribute('href') ?? '',
      layout,
    };
  }
  const text = el.textContent?.trim() ?? '';
  if (type === 'markdown') return { type: 'markdown', markdown: text, layout };
  return { type: 'plain', text, layout };
}

export function applyValueToElement(el: HTMLElement, value: FieldValue) {
  const applyLayout = () => {
    if (value.layout) applyLayoutToElement(el, value.layout);
  };

  switch (value.type) {
    case 'plain':
      el.textContent = value.text;
      applyLayout();
      break;
    case 'markdown': {
      const existingRoot = markdownRoots.get(el);
      if (existingRoot) {
        existingRoot.unmount();
        markdownRoots.delete(el);
      }
      el.textContent = '';
      const root = createRoot(el);
      markdownRoots.set(el, root);
      root.render(
        createElement(Markdown, {
          options: {
            forceBlock: true,
            overrides: { a: { props: { className: 'text-gold underline' } } },
          },
          children: value.markdown,
        }),
      );
      applyLayout();
      break;
    }
    case 'link': {
      const anchor = el.tagName === 'A' ? (el as HTMLAnchorElement) : el.querySelector('a') ?? el;
      if (anchor instanceof HTMLAnchorElement) {
        anchor.textContent = value.text;
        anchor.setAttribute('href', value.href || '#');
      } else {
        el.textContent = value.text;
      }
      applyLayout();
      break;
    }
    case 'image':
      if (el.tagName === 'IMG') {
        applyMediaUrl(el as HTMLImageElement, value.url);
        applyLayout();
      }
      break;
    case 'video':
      if (el.tagName === 'VIDEO') {
        applyMediaUrl(el as HTMLVideoElement, value.url);
        applyLayout();
      }
      break;
    default:
      break;
  }
}

export function resolveElementForField(fieldId: string, hint?: HTMLElement | null): HTMLElement | null {
  if (hint?.isConnected) return hint;

  try {
    const byId = document.querySelector(`[data-editable-id="${CSS.escape(fieldId)}"]`) as HTMLElement | null;
    if (byId) return byId;
  } catch {
    const byId = document.querySelector(`[data-editable-id="${fieldId}"]`) as HTMLElement | null;
    if (byId) return byId;
  }

  if (fieldId.startsWith('img-') || fieldId.startsWith('video-')) {
    const tag = fieldId.startsWith('video-') ? 'VIDEO' : 'IMG';
    for (const node of document.querySelectorAll(tag)) {
      if (getStableKey(node as HTMLElement) === fieldId) {
        return node as HTMLElement;
      }
    }
  }

  for (const node of document.querySelectorAll('h1, h2, h3, h4, p, span, a, li, button')) {
    const el = node as HTMLElement;
    if (getStableKey(el) === fieldId) {
      return el;
    }
  }

  return null;
}

export function stampEditableId(el: HTMLElement, fieldId: string) {
  if (!el.getAttribute('data-editable-id')) {
    el.setAttribute('data-editable-id', fieldId);
  }
}

export function getElementForField(fieldId: string): HTMLElement | null {
  return resolveElementForField(fieldId);
}

export function highlightElement(el: HTMLElement, active: boolean) {
  if (active) {
    el.style.outline = '2px solid #D3B051';
    el.style.outlineOffset = '4px';
    el.style.boxShadow = '0 0 0 4px rgba(211, 176, 81, 0.25)';
  } else {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.boxShadow = '';
  }
}

/** Legacy apply path for DB rows (used on route load). */
function storedMediaUrlEmpty(edit_type: string, raw: string): boolean {
  if (edit_type !== 'image' && edit_type !== 'video') return false;
  const parsed = parseStoredValue(edit_type, raw, edit_type as 'image');
  if (parsed.type === 'image' || parsed.type === 'video') {
    return !parsed.url?.trim();
  }
  return !raw.trim();
}

function legacyHomeImageFieldId(row: { element_key: string; value: string }): string | null {
  if (!row.element_key.startsWith('img-')) return null;
  const v = row.value.toLowerCase();
  if (v.includes('one-statement') || v.includes('02-home-one-statement')) {
    return 'home-one-statement-image';
  }
  if (v.includes('about-eam') || v.includes('02-home-about')) {
    return 'home-about-eam-image';
  }
  return null;
}

const HOME_SECTION_IMAGE_IDS = ['home-about-eam-image', 'home-one-statement-image'] as const;
const HOME_HERO_BG_ID = 'home-hero-bg-image';

export function isInsideHomeHero(el: HTMLElement | null): boolean {
  return Boolean(el?.closest('#home-hero'));
}

/** Reset hero background + strip accidental editor transforms (match `/services/platforms`). */
export function ensureHomeHeroDefaults() {
  const el =
    (resolveElementForField(HOME_HERO_BG_ID) as HTMLImageElement | null) ??
    (document.querySelector('.home-hero-bg-img') as HTMLImageElement | null);
  if (!el || el.tagName !== 'IMG') return;

  stampEditableId(el, HOME_HERO_BG_ID);
  resetEditorTransformsOnElement(el);

  const bundled = getHomeImage('hero').src;
  const def = el.getAttribute('data-editor-default-src') || bundled;
  if (!el.getAttribute('data-editor-default-src')) {
    el.setAttribute('data-editor-default-src', bundled);
  }

  const parent = el.parentElement;
  if (parent?.classList.contains('home-hero-static-bg')) {
    parent.style.position = '';
  }

  const src = el.currentSrc || el.src;
  const looksWrong =
    !src.trim() ||
    src === window.location.href ||
    (!src.includes('01-home-hero') && !src.includes('home-hero'));
  if (looksWrong && def) {
    el.src = def;
  }

  for (const node of document.querySelectorAll('#home-hero video, #home-hero .home-hero-emblem-img')) {
    resetEditorTransformsOnElement(node as HTMLElement);
  }
}

const HOME_SECTION_ASSET_KEY: Record<(typeof HOME_SECTION_IMAGE_IDS)[number], 'aboutEam' | 'oneStatement'> = {
  'home-about-eam-image': 'aboutEam',
  'home-one-statement-image': 'oneStatement',
};

function bundledSectionImageSrc(fieldId: (typeof HOME_SECTION_IMAGE_IDS)[number]): string {
  return getHomeImage(HOME_SECTION_ASSET_KEY[fieldId]).src;
}

function sectionImageLooksBroken(fieldId: string, src: string, bundledSrc: string): boolean {
  if (!src.trim() || src === window.location.href) return true;
  const needle =
    fieldId === 'home-about-eam-image'
      ? 'about-eam'
      : fieldId === 'home-one-statement-image'
        ? 'one-statement'
        : '';
  if (!needle) return false;
  return !src.includes(needle) && src !== bundledSrc;
}

/** Force bundled PNG/JPG if overrides left the img broken, empty, or editor-transformed off-screen. */
export function ensureHomeSectionImageDefaults() {
  for (const id of HOME_SECTION_IMAGE_IDS) {
    const el = resolveElementForField(id);
    if (!el || el.tagName !== 'IMG') continue;
    const img = el as HTMLImageElement;
    const bundled = bundledSectionImageSrc(id);
    const def = el.getAttribute('data-editor-default-src') || bundled;
    if (!el.getAttribute('data-editor-default-src')) {
      el.setAttribute('data-editor-default-src', bundled);
    }

    resetEditorTransformsOnElement(el);
    const visualHost = img.closest('.home-about-eam__visual, .home-one-statement__visual') as HTMLElement | null;
    if (visualHost) {
      visualHost.style.position = '';
      visualHost.style.overflow = '';
    }

    const src = img.currentSrc || img.src;
    if (sectionImageLooksBroken(id, src, bundled)) {
      img.src = def;
    }
  }
}

export async function applyLegacyEditsFromRows(
  rows: { element_key: string; edit_type: string; value: string }[],
) {
  for (const row of rows) {
    if (storedMediaUrlEmpty(row.edit_type, row.value)) continue;
    let fieldId = row.element_key;
    let el = resolveElementForField(fieldId);
    const legacyId = legacyHomeImageFieldId(row);
    if (!el && legacyId) {
      fieldId = legacyId;
      el = resolveElementForField(fieldId);
    }
    if (!el) continue;
    if (isInsideHomeHero(el) && fieldId !== HOME_HERO_BG_ID) continue;
    stampEditableId(el, fieldId);
    const fallback = row.edit_type === 'markdown' ? 'markdown' : row.edit_type === 'link' ? 'link' : 'plain';
    const parsed = parseStoredValue(row.edit_type, row.value, fallback as 'plain');
    applyValueToElement(el, parsed);
  }
}
