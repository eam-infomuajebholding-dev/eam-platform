import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSiteEditor } from '../context/SiteEditorContext';
import { useMediaLibrary } from '@/features/media-library';
import {
  getStableKey,
  isImageElement,
  isInsideEditUI,
  isVideoElement,
  resolveEditTarget,
} from '@/components/admin/editOverlayUtils';

export default function EditorCanvasLayer() {
  const { enabled, selectField, selectedFieldId, replaceFieldValue } = useSiteEditor();
  const { openPicker } = useMediaLibrary();

  useEffect(() => {
    if (!enabled) return;

    document.body.setAttribute('data-site-editor-active', 'true');
    const style = document.createElement('style');
    style.textContent = `
      body[data-site-editor-active="true"] [data-editable-id],
      body[data-site-editor-active="true"] img,
      body[data-site-editor-active="true"] video {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);

    const openMediaPickerFor = (el: HTMLElement, kind: 'image' | 'video') => {
      const fieldId = getStableKey(el);
      openPicker({
        kind,
        title: kind === 'video' ? 'استبدال الفيديو من المكتبة' : 'استبدال الصورة من المكتبة',
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

      let node: HTMLElement | null = target;
      while (node && node !== document.body) {
        if (isInsideEditUI(node)) return;
        if (isImageElement(node)) {
          event.preventDefault();
          event.stopPropagation();
          openMediaPickerFor(node, 'image');
          return;
        }
        if (isVideoElement(node)) {
          event.preventDefault();
          event.stopPropagation();
          openMediaPickerFor(node, 'video');
          return;
        }
        node = node.parentElement;
      }

      const editable = target.closest('[data-editable-id]') as HTMLElement | null;
      if (editable) {
        event.preventDefault();
        event.stopPropagation();
        const id = editable.getAttribute('data-editable-id');
        if (id) selectField(id);
        return;
      }
      const resolved = resolveEditTarget(target);
      if (resolved) {
        event.preventDefault();
        event.stopPropagation();
        selectField(getStableKey(resolved.el));
      }
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.body.removeAttribute('data-site-editor-active');
      style.remove();
      document.removeEventListener('click', onClick, true);
    };
  }, [enabled, selectField, openPicker, replaceFieldValue]);

  if (!enabled) return null;

  return createPortal(
    <div data-edit-overlay="true" className="pointer-events-none fixed inset-0 z-[9997]" aria-hidden>
      {selectedFieldId ? (
        <div className="fixed bottom-24 left-4 max-w-xs rounded-lg bg-[#1a1a2e]/90 px-3 py-2 text-xs text-gold shadow-lg">
          محرّر: {selectedFieldId}
          <span className="mt-1 block text-[10px] text-white/60">انقر صورة/فيديو لفتح المكتبة مباشرة</span>
        </div>
      ) : (
        <div className="fixed bottom-24 left-4 rounded-lg bg-[#1a1a2e]/90 px-3 py-2 text-xs text-white/75 shadow-lg">
          انقر أي صورة أو فيديو لاختيار بديل من المكتبة
        </div>
      )}
    </div>,
    document.body,
  );
}
