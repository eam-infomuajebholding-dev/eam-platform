import { useEffect, useRef } from 'react';
import { useSiteEditor } from '../context/SiteEditorContext';
import { useMediaLibrary } from '@/features/media-library';
import {
  getStableKey,
  isImageElement,
  isInsideEditUI,
  isProtectedHomeHeroElement,
  isVideoElement,
  resolveEditTarget,
} from '@/components/admin/editOverlayUtils';

export default function EditorCanvasLayer() {
  const { enabled, selectField, replaceFieldValue } = useSiteEditor();
  const { openPicker } = useMediaLibrary();
  const clickTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    document.body.setAttribute('data-site-editor-active', 'true');
    const style = document.createElement('style');
    style.textContent = `
      body[data-site-editor-active="true"] [data-editable-id],
      body[data-site-editor-active="true"] img,
      body[data-site-editor-active="true"] video,
      body[data-site-editor-active="true"] h1,
      body[data-site-editor-active="true"] h2,
      body[data-site-editor-active="true"] h3,
      body[data-site-editor-active="true"] p,
      body[data-site-editor-active="true"] a {
        cursor: default !important;
      }
    `;
    document.head.appendChild(style);

    const openMediaPickerFor = (el: HTMLElement, kind: 'image' | 'video') => {
      const fieldId = getStableKey(el);
      openPicker({
        kind,
        title: kind === 'video' ? 'استبدال الفيديو' : 'استبدال الصورة',
        onSelect: (item) => {
          replaceFieldValue(
            fieldId,
            kind === 'video' ? { type: 'video', url: item.url } : { type: 'image', url: item.url },
            el,
          );
        },
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target || isInsideEditUI(target)) return;
      if (isProtectedHomeHeroElement(target)) {
        const replay = target.closest('.home-hero-replay-promo');
        if (!replay) return;
      }

      let node: HTMLElement | null = target;
      while (node && node !== document.body) {
        if (isInsideEditUI(node)) return;
        if (isImageElement(node) || isVideoElement(node)) {
          event.preventDefault();
          event.stopPropagation();
          const el = node;
          const kind = isVideoElement(node) ? 'video' : 'image';
          const fieldId = getStableKey(el);

          if (event.detail >= 2) {
            if (clickTimer.current) window.clearTimeout(clickTimer.current);
            openMediaPickerFor(el, kind);
            return;
          }

          if (clickTimer.current) window.clearTimeout(clickTimer.current);
          clickTimer.current = window.setTimeout(() => {
            selectField(fieldId, el, { openContentSheet: false });
            clickTimer.current = null;
          }, 220);
          return;
        }
        node = node.parentElement;
      }

      const editable = target.closest('[data-editable-id]') as HTMLElement | null;
      if (editable) {
        event.preventDefault();
        event.stopPropagation();
        const id = editable.getAttribute('data-editable-id');
        if (!id) return;
        const isMediaEl = isImageElement(editable) || isVideoElement(editable);
        selectField(id, editable, {
          openContentSheet: !isMediaEl && event.detail >= 2,
        });
        return;
      }

      const resolved = resolveEditTarget(target);
      if (resolved) {
        event.preventDefault();
        event.stopPropagation();
        const fieldId = getStableKey(resolved.el);
        if (event.detail >= 2) {
          selectField(fieldId, resolved.el, { openContentSheet: true });
        } else {
          selectField(fieldId, resolved.el, { openContentSheet: false });
        }
      }
    };

    document.addEventListener('click', onClick, true);
    return () => {
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
      document.body.removeAttribute('data-site-editor-active');
      style.remove();
      document.removeEventListener('click', onClick, true);
    };
  }, [enabled, selectField, openPicker, replaceFieldValue]);

  return null;
}
