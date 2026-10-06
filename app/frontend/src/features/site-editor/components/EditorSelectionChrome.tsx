import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveElementForField, stampEditableId } from '../domApply';
import {
  applyLayoutToElement,
  computeBoxResize,
  computeMoveLayout,
  getOffsetStart,
  isCornerHandle,
  prepareElementForBoxResize,
  prepareElementForFreeMove,
  readLayoutFromElement,
  type ResizeHandle,
} from '../layoutUtils';
import { useSiteEditor } from '../context/SiteEditorContext';

const HANDLES: { id: ResizeHandle; className: string; cursor: string }[] = [
  { id: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 z-20', cursor: 'nwse-resize' },
  { id: 'n', className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20', cursor: 'ns-resize' },
  { id: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 z-20', cursor: 'nesw-resize' },
  { id: 'e', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20', cursor: 'ew-resize' },
  { id: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 z-20', cursor: 'nwse-resize' },
  { id: 's', className: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20', cursor: 'ns-resize' },
  { id: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 z-20', cursor: 'nesw-resize' },
  { id: 'w', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20', cursor: 'ew-resize' },
];

function beginDragSession(setDragging: (v: boolean) => void) {
  setDragging(true);
  document.body.classList.add('site-editor-resizing');
  document.body.style.userSelect = 'none';
}

function endDragSession(setDragging: (v: boolean) => void) {
  document.body.classList.remove('site-editor-resizing');
  document.body.style.userSelect = '';
  setDragging(false);
}

export default function EditorSelectionChrome() {
  const { enabled, selectedFieldId, fields, patchSelectedLayout } = useSiteEditor();
  const [box, setBox] = useState<DOMRect | null>(null);
  const [dragging, setDragging] = useState(false);

  const record = selectedFieldId ? fields[selectedFieldId] : null;
  const isMedia = record?.value.type === 'image' || record?.value.type === 'video';

  useEffect(() => {
    if (!enabled || !selectedFieldId) {
      setBox(null);
      return;
    }
    const el = resolveElementForField(selectedFieldId);
    if (!el) {
      setBox(null);
      return;
    }
    stampEditableId(el, selectedFieldId);

    const update = () => {
      if (dragging) return;
      setBox(el.getBoundingClientRect());
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [enabled, selectedFieldId, fields, dragging]);

  const commitLayout = useCallback(
    (el: HTMLElement) => {
      const read = readLayoutFromElement(el);
      if (read) patchSelectedLayout(read);
      setBox(el.getBoundingClientRect());
    },
    [patchSelectedLayout],
  );

  const onMovePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedFieldId) return;
      const el = resolveElementForField(selectedFieldId);
      if (!el) return;

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      prepareElementForFreeMove(el, Boolean(isMedia));
      const start = getOffsetStart(el);
      const startX = event.clientX;
      const startY = event.clientY;

      beginDragSession(setDragging);

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== event.pointerId) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        applyLayoutToElement(el, computeMoveLayout(start.left, start.top, dx, dy));
        setBox(el.getBoundingClientRect());
      };

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== event.pointerId) return;
        target.releasePointerCapture(event.pointerId);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        endDragSession(setDragging);
        commitLayout(el);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    },
    [selectedFieldId, isMedia, commitLayout],
  );

  const onHandlePointerDown = useCallback(
    (handle: ResizeHandle, event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedFieldId) return;
      const el = resolveElementForField(selectedFieldId);
      if (!el) return;

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      prepareElementForBoxResize(el, Boolean(isMedia));
      const start = getOffsetStart(el);
      const startX = event.clientX;
      const startY = event.clientY;

      beginDragSession(setDragging);

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== event.pointerId) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const corner = isCornerHandle(handle);
        const lockAspect = Boolean(isMedia && corner && !ev.shiftKey);

        const patch = computeBoxResize({
          handle,
          startW: start.w,
          startH: start.h,
          startLeft: start.left,
          startTop: start.top,
          dx,
          dy,
          isMedia: Boolean(isMedia),
          lockAspect,
        });
        applyLayoutToElement(el, patch);
        setBox(el.getBoundingClientRect());
      };

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== event.pointerId) return;
        target.releasePointerCapture(event.pointerId);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        endDragSession(setDragging);
        commitLayout(el);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    },
    [selectedFieldId, isMedia, commitLayout],
  );

  if (!enabled || !selectedFieldId || !box) return null;

  return createPortal(
    <div
      data-edit-transform="true"
      data-edit-overlay="true"
      className="site-editor-transform-layer pointer-events-none fixed z-[10140]"
      style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
    >
      <div
        role="presentation"
        className="absolute inset-0 z-10 cursor-move rounded-sm border-2 border-gold shadow-[0_0_0_1px_rgba(0,0,0,0.25)] pointer-events-auto"
        style={{ touchAction: 'none' }}
        onPointerDown={onMovePointerDown}
        aria-label="اسحب لنقل العنصر"
      />
      {HANDLES.map((h) => (
        <button
          key={h.id}
          type="button"
          aria-label={`تغيير الحجم ${h.id}`}
          className={`site-editor-transform-handle pointer-events-auto absolute h-4 w-4 rounded-sm border-2 border-white bg-gold shadow-md ${h.className}`}
          style={{ cursor: h.cursor, touchAction: 'none' }}
          onPointerDown={(e) => onHandlePointerDown(h.id, e)}
        />
      ))}
    </div>,
    document.body,
  );
}
