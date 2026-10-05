import Markdown from 'markdown-to-jsx';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { getMediaFromIDB } from '@/lib/mediaStorage';
import { parseStoredValue } from './serialization';
import type { FieldValue } from './types';

const markdownRoots = new WeakMap<HTMLElement, Root>();

function applyMediaUrl(el: HTMLImageElement | HTMLVideoElement, value: string) {
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

  if (value.startsWith('idb://')) {
    const idbKey = value.replace('idb://', '');
    void getMediaFromIDB(idbKey).then((dataUrl) => {
      if (dataUrl) setSrc(dataUrl);
    });
    return;
  }
  setSrc(value);
}

export function readValueFromElement(el: HTMLElement, type: FieldValue['type']): FieldValue {
  if (type === 'image' && el.tagName === 'IMG') {
    return { type: 'image', url: (el as HTMLImageElement).src };
  }
  if (type === 'video' && el.tagName === 'VIDEO') {
    const video = el as HTMLVideoElement;
    const src = video.querySelector('source')?.getAttribute('src') ?? video.src;
    return { type: 'video', url: src };
  }
  if (type === 'link' && el.tagName === 'A') {
    const anchor = el as HTMLAnchorElement;
    return { type: 'link', text: anchor.textContent?.trim() ?? '', href: anchor.getAttribute('href') ?? '' };
  }
  const text = el.textContent?.trim() ?? '';
  if (type === 'markdown') return { type: 'markdown', markdown: text };
  return { type: 'plain', text };
}

export function applyValueToElement(el: HTMLElement, value: FieldValue) {
  switch (value.type) {
    case 'plain':
      el.textContent = value.text;
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
      break;
    }
    case 'image':
      if (el.tagName === 'IMG') applyMediaUrl(el as HTMLImageElement, value.url);
      break;
    case 'video':
      if (el.tagName === 'VIDEO') applyMediaUrl(el as HTMLVideoElement, value.url);
      break;
    default:
      break;
  }
}

export function getElementForField(fieldId: string): HTMLElement | null {
  return document.querySelector(`[data-editable-id="${fieldId}"]`) as HTMLElement | null;
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
export async function applyLegacyEditsFromRows(
  rows: { element_key: string; edit_type: string; value: string }[],
) {
  for (const row of rows) {
    const el = getElementForField(row.element_key);
    if (!el) continue;
    const fallback = row.edit_type === 'markdown' ? 'markdown' : row.edit_type === 'link' ? 'link' : 'plain';
    const parsed = parseStoredValue(row.edit_type, row.value, fallback as 'plain');
    applyValueToElement(el, parsed);
  }
}
