import type { ElementLayout, FieldType, FieldValue } from './types';
import { hasLayout } from './layoutUtils';

function tryParseJson(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function serializeWithLayout(
  edit_type: string,
  payload: Record<string, unknown>,
  legacyScalar?: string,
): { edit_type: string; value: string } {
  const keys = Object.keys(payload).filter((k) => k !== 'layout' || hasLayout(payload.layout as ElementLayout));
  const onlyScalar =
    legacyScalar != null &&
    keys.length === 1 &&
    (keys[0] === 'text' || keys[0] === 'markdown' || keys[0] === 'url');
  if (onlyScalar && !hasLayout(payload.layout as ElementLayout)) {
    return { edit_type, value: legacyScalar };
  }
  return { edit_type, value: JSON.stringify(payload) };
}

export function serializeFieldValue(type: FieldType, value: FieldValue): { edit_type: string; value: string } {
  switch (value.type) {
    case 'plain':
      return serializeWithLayout('text', { text: value.text, layout: value.layout }, value.text);
    case 'markdown':
      return serializeWithLayout(
        'markdown',
        { markdown: value.markdown, layout: value.layout },
        value.markdown,
      );
    case 'link':
      return serializeWithLayout('link', {
        text: value.text,
        href: value.href,
        layout: value.layout,
      });
    case 'image':
      return serializeWithLayout('image', { url: value.url, layout: value.layout }, value.url);
    case 'video':
      return serializeWithLayout('video', { url: value.url, layout: value.layout }, value.url);
    default:
      return { edit_type: type, value: '' };
  }
}

export function parseStoredValue(edit_type: string, raw: string, fallbackType: FieldType): FieldValue {
  const parsed = tryParseJson(raw);
  const layout = parsed?.layout as ElementLayout | undefined;

  switch (edit_type) {
    case 'markdown': {
      if (parsed && typeof parsed.markdown === 'string') {
        return { type: 'markdown', markdown: parsed.markdown, layout };
      }
      return { type: 'markdown', markdown: raw };
    }
    case 'link': {
      if (parsed && typeof parsed.text === 'string') {
        return {
          type: 'link',
          text: parsed.text,
          href: typeof parsed.href === 'string' ? parsed.href : '#',
          layout,
        };
      }
      try {
        const legacy = JSON.parse(raw) as { text?: string; href?: string };
        return { type: 'link', text: legacy.text ?? '', href: legacy.href ?? '#' };
      } catch {
        return { type: 'link', text: raw, href: '#' };
      }
    }
    case 'image': {
      if (parsed && typeof parsed.url === 'string') {
        return { type: 'image', url: parsed.url, layout };
      }
      return { type: 'image', url: raw };
    }
    case 'video': {
      if (parsed && typeof parsed.url === 'string') {
        return { type: 'video', url: parsed.url, layout };
      }
      return { type: 'video', url: raw };
    }
    case 'text':
    default: {
      if (parsed && typeof parsed.text === 'string') {
        return { type: 'plain', text: parsed.text, layout };
      }
      if (fallbackType === 'markdown') return { type: 'markdown', markdown: raw };
      return { type: 'plain', text: raw };
    }
  }
}

export function valuesEqual(a: FieldValue, b: FieldValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function snapshotFromRecords(records: Record<string, { value: FieldValue }>): Record<string, FieldValue> {
  const snap: Record<string, FieldValue> = {};
  for (const [id, row] of Object.entries(records)) snap[id] = row.value;
  return snap;
}
