import type { ElementLayout } from './types';

const LAYOUT_KEYS: (keyof ElementLayout)[] = [
  'width',
  'height',
  'maxWidth',
  'minHeight',
  'position',
  'left',
  'top',
  'zIndex',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'objectFit',
];

const MIN_W = 24;
const MIN_H = 20;

export function hasLayout(layout?: ElementLayout): boolean {
  if (!layout) return false;
  return LAYOUT_KEYS.some((key) => layout[key] != null && layout[key] !== '');
}

export function mergeLayout(base?: ElementLayout, patch?: Partial<ElementLayout>): ElementLayout | undefined {
  const next = { ...base, ...patch };
  return hasLayout(next) ? next : undefined;
}

function parsePx(value: string | undefined): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function readLayoutFromElement(el: HTMLElement): ElementLayout | undefined {
  const style = el.style;
  const layout: ElementLayout = {
    width: style.width || undefined,
    height: style.height || undefined,
    maxWidth: style.maxWidth || undefined,
    minHeight: style.minHeight || undefined,
    position: (style.position as ElementLayout['position']) || undefined,
    left: style.left || undefined,
    top: style.top || undefined,
    zIndex: style.zIndex || undefined,
    fontSize: style.fontSize || undefined,
    fontFamily: style.fontFamily || undefined,
    fontWeight: style.fontWeight || undefined,
    lineHeight: style.lineHeight || undefined,
    letterSpacing: style.letterSpacing || undefined,
    textAlign: (style.textAlign as ElementLayout['textAlign']) || undefined,
    objectFit: style.objectFit || undefined,
  };
  return hasLayout(layout) ? layout : undefined;
}

export function prepareElementForFreeMove(el: HTMLElement, isMedia: boolean) {
  const rect = el.getBoundingClientRect();
  const style = el.style;
  const parent = el.parentElement;
  if (parent && getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  if (style.position !== 'absolute' && style.position !== 'fixed') {
    const parentRect = parent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    style.position = 'absolute';
    style.left = `${Math.round(rect.left - parentRect.left)}px`;
    style.top = `${Math.round(rect.top - parentRect.top)}px`;
    style.width = `${Math.round(rect.width)}px`;
    if (isMedia || el.tagName === 'IMG' || el.tagName === 'VIDEO') {
      style.height = `${Math.round(rect.height)}px`;
      style.display = 'block';
    }
    style.margin = '0';
    style.zIndex = style.zIndex || '5';
  }

  style.boxSizing = 'border-box';
}

export function prepareElementForBoxResize(el: HTMLElement, isMedia: boolean) {
  prepareElementForFreeMove(el, isMedia);
  const rect = el.getBoundingClientRect();
  const style = el.style;
  style.boxSizing = 'border-box';

  if (!style.width) style.width = `${Math.round(rect.width)}px`;
  if (isMedia || el.tagName === 'IMG' || el.tagName === 'VIDEO') {
    style.display = 'block';
    if (!style.height) style.height = `${Math.round(rect.height)}px`;
    style.maxWidth = 'none';
  } else {
    style.display = style.display === 'inline' ? 'inline-block' : style.display || 'block';
    if (!style.height) style.height = `${Math.round(rect.height)}px`;
  }

}

export function computeMoveLayout(startLeft: number, startTop: number, dx: number, dy: number): ElementLayout {
  return {
    position: 'absolute',
    left: `${Math.round(startLeft + dx)}px`,
    top: `${Math.round(startTop + dy)}px`,
  };
}

export function applyLayoutToElement(el: HTMLElement, layout?: ElementLayout) {
  if (!layout) return;
  const style = el.style;

  if (layout.position) {
    style.position = layout.position;
    if (layout.position === 'absolute' && el.parentElement) {
      const parent = el.parentElement;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
    }
  }
  if (layout.zIndex) style.zIndex = layout.zIndex;

  if (layout.width) {
    style.width = layout.width;
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {
      style.maxWidth = 'none';
    }
  }
  if (layout.height) style.height = layout.height;
  if (layout.maxWidth) style.maxWidth = layout.maxWidth;
  if (layout.minHeight) style.minHeight = layout.minHeight;
  if (layout.left != null) style.left = layout.left;
  if (layout.top != null) style.top = layout.top;
  if (layout.fontSize) style.fontSize = layout.fontSize;
  if (layout.fontFamily) style.fontFamily = layout.fontFamily;
  if (layout.fontWeight) style.fontWeight = layout.fontWeight;
  if (layout.lineHeight) style.lineHeight = layout.lineHeight;
  if (layout.letterSpacing) style.letterSpacing = layout.letterSpacing;
  if (layout.textAlign) style.textAlign = layout.textAlign;
  if (layout.objectFit && (el.tagName === 'IMG' || el.tagName === 'VIDEO')) {
    style.objectFit = layout.objectFit;
  }
  if (layout.width || layout.height) {
    style.boxSizing = 'border-box';
  }
}

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function isCornerHandle(handle: ResizeHandle): boolean {
  return handle.length === 2;
}

export function computeBoxResize(args: {
  handle: ResizeHandle;
  startW: number;
  startH: number;
  startLeft: number;
  startTop: number;
  dx: number;
  dy: number;
  isMedia: boolean;
  lockAspect: boolean;
}): ElementLayout {
  const { handle, startW, startH, startLeft, startTop, dx, dy, isMedia, lockAspect } = args;

  let w = startW;
  let h = startH;

  if (handle.includes('e')) w = startW + dx;
  if (handle.includes('w')) w = startW - dx;
  if (handle.includes('s')) h = startH + dy;
  if (handle.includes('n')) h = startH - dy;

  w = Math.max(MIN_W, Math.round(w));
  h = Math.max(MIN_H, Math.round(h));

  const corner = isCornerHandle(handle);
  if (lockAspect && isMedia && corner && startW > 0 && startH > 0) {
    const ratio = startW / startH;
    const wDelta = Math.abs(w - startW);
    const hDelta = Math.abs(h - startH);
    if (wDelta >= hDelta) {
      h = Math.max(MIN_H, Math.round(w / ratio));
    } else {
      w = Math.max(MIN_W, Math.round(h * ratio));
    }
  }

  let left = startLeft;
  let top = startTop;
  if (handle.includes('w')) left = startLeft + (startW - w);
  if (handle.includes('n')) top = startTop + (startH - h);

  const patch: ElementLayout = {
    position: 'absolute',
    width: `${w}px`,
    height: `${h}px`,
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  };

  if (!isMedia && (handle === 'e' || handle === 'w')) {
    delete patch.height;
  }
  if (!isMedia && (handle === 'n' || handle === 's')) {
    delete patch.width;
  }

  return patch;
}

/** Strip inline transforms applied by the site editor (move/resize). */
export function resetEditorTransformsOnElement(el: HTMLElement) {
  const style = el.style;
  style.position = '';
  style.left = '';
  style.top = '';
  style.width = '';
  style.height = '';
  style.maxWidth = '';
  style.minHeight = '';
  style.zIndex = '';
  style.margin = '';
  style.display = '';
  style.boxSizing = '';
  style.objectFit = '';
  style.fontSize = '';
  style.fontFamily = '';
  style.fontWeight = '';
  style.lineHeight = '';
  style.letterSpacing = '';
  style.textAlign = '';
}

export function getOffsetStart(el: HTMLElement): { left: number; top: number; w: number; h: number } {
  const rect = el.getBoundingClientRect();
  const parent = el.parentElement;
  const parentRect = parent?.getBoundingClientRect();
  const left =
    el.style.position === 'absolute' && parentRect
      ? parsePx(el.style.left)
      : parentRect
        ? rect.left - parentRect.left
        : parsePx(el.style.left);
  const top =
    el.style.position === 'absolute' && parentRect
      ? parsePx(el.style.top)
      : parentRect
        ? rect.top - parentRect.top
        : parsePx(el.style.top);
  return {
    left,
    top,
    w: rect.width,
    h: rect.height,
  };
}
