import type { FieldValue } from './types';

export type EditorClipboardPayload = {
  value: FieldValue;
  sourceFieldId: string;
  pagePath: string;
  copiedAt: number;
};

let clipboard: EditorClipboardPayload | null = null;

export function setEditorClipboard(payload: EditorClipboardPayload) {
  clipboard = payload;
}

export function getEditorClipboard(): EditorClipboardPayload | null {
  return clipboard;
}

export function clearEditorClipboard() {
  clipboard = null;
}

/** Merge clipboard content into the target field value (PowerPoint-style paste). */
export function mergePasteValue(target: FieldValue, source: FieldValue): FieldValue | null {
  const layout = source.layout ?? ('layout' in target ? target.layout : undefined);

  if (target.type === 'image' && source.type === 'image') {
    return { type: 'image', url: source.url, layout: layout ?? target.layout };
  }
  if (target.type === 'video' && source.type === 'video') {
    return { type: 'video', url: source.url, layout: layout ?? target.layout };
  }
  if (target.type === 'plain') {
    const text =
      source.type === 'plain'
        ? source.text
        : source.type === 'markdown'
          ? source.markdown
          : source.type === 'link'
            ? source.text
            : null;
    if (text == null) return { ...target, layout: layout ?? target.layout };
    return { type: 'plain', text, layout: layout ?? target.layout };
  }
  if (target.type === 'markdown') {
    const markdown =
      source.type === 'markdown'
        ? source.markdown
        : source.type === 'plain'
          ? source.text
          : null;
    if (markdown == null) return { ...target, layout: layout ?? target.layout };
    return { type: 'markdown', markdown, layout: layout ?? target.layout };
  }
  if (target.type === 'link' && source.type === 'link') {
    return { type: 'link', text: source.text, href: source.href, layout: layout ?? target.layout };
  }

  if (layout && 'layout' in target) {
    return { ...target, layout };
  }
  return null;
}

/** Value applied to the source field after cut (copy + clear). */
export function clearedValueAfterCut(value: FieldValue, baseline: FieldValue): FieldValue {
  const layout = value.layout;
  switch (value.type) {
    case 'plain':
      return { type: 'plain', text: '', layout };
    case 'markdown':
      return { type: 'markdown', markdown: '', layout };
    case 'link':
      return { type: 'link', text: '', href: '', layout };
    case 'image':
      if (baseline.type === 'image') return { type: 'image', url: baseline.url, layout };
      return { type: 'image', url: '', layout };
    case 'video':
      if (baseline.type === 'video') return { type: 'video', url: baseline.url, layout };
      return { type: 'video', url: '', layout };
    default:
      return value;
  }
}
