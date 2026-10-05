import type { FieldType, FieldValue } from './types';

export function serializeFieldValue(type: FieldType, value: FieldValue): { edit_type: string; value: string } {
  switch (value.type) {
    case 'plain':
      return { edit_type: 'text', value: value.text };
    case 'markdown':
      return { edit_type: 'markdown', value: value.markdown };
    case 'link':
      return { edit_type: 'link', value: JSON.stringify({ text: value.text, href: value.href }) };
    case 'image':
      return { edit_type: 'image', value: value.url };
    case 'video':
      return { edit_type: 'video', value: value.url };
    default:
      return { edit_type: type, value: '' };
  }
}

export function parseStoredValue(edit_type: string, raw: string, fallbackType: FieldType): FieldValue {
  switch (edit_type) {
    case 'markdown':
      return { type: 'markdown', markdown: raw };
    case 'link':
      try {
        const parsed = JSON.parse(raw) as { text?: string; href?: string };
        return { type: 'link', text: parsed.text ?? '', href: parsed.href ?? '' };
      } catch {
        return { type: 'link', text: raw, href: '#' };
      }
    case 'image':
      return { type: 'image', url: raw };
    case 'video':
      return { type: 'video', url: raw };
    case 'text':
    default:
      if (fallbackType === 'markdown') return { type: 'markdown', markdown: raw };
      return { type: 'plain', text: raw };
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
