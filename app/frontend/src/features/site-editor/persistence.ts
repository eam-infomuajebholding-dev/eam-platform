import { deleteEdit, invalidateCache, loadEditsForPage, saveEdit } from '@/lib/dbService';
import { parseStoredValue, serializeFieldValue } from './serialization';
import type { FieldRecord, FieldValue } from './types';
import { resolveFieldMeta } from './fieldRegistry';
import { applyLegacyEditsFromRows, getElementForField, readValueFromElement } from './domApply';

export async function loadPageFieldRecords(page: string): Promise<Record<string, FieldRecord>> {
  invalidateCache(page);
  const rows = await loadEditsForPage(page);
  const records: Record<string, FieldRecord> = {};

  for (const row of rows) {
    const meta = resolveFieldMeta(row.element_key, page);
    const value = parseStoredValue(row.edit_type, row.value, meta.type);
    records[row.element_key] = {
      meta,
      value,
      baseline: value,
      persistedId: row.id,
      dirty: false,
    };
  }

  await applyLegacyEditsFromRows(rows);

  if (typeof document !== 'undefined') {
    for (const el of document.querySelectorAll('[data-editable-id]')) {
      const id = el.getAttribute('data-editable-id');
      if (!id || records[id]) continue;
      const meta = resolveFieldMeta(id, page);
      const value = readValueFromElement(el as HTMLElement, meta.type === 'markdown' ? 'markdown' : meta.type);
      records[id] = { meta, value, baseline: value, dirty: false };
    }
  }

  return records;
}

export async function persistField(page: string, fieldId: string, record: FieldRecord): Promise<number | undefined> {
  const { edit_type, value } = serializeFieldValue(record.meta.type, record.value);
  await saveEdit(page, fieldId, edit_type, value);
  const rows = await loadEditsForPage(page);
  const match = rows.find((r) => r.element_key === fieldId);
  return match?.id;
}

export async function removePersistedField(id: number, page: string): Promise<void> {
  await deleteEdit(id);
  invalidateCache(page);
}

export async function applySavedEditsForRoute(page: string = window.location.pathname) {
  const rows = await loadEditsForPage(page);
  if (rows.length === 0) return;
  await applyLegacyEditsFromRows(rows);
}

export function bootstrapFieldFromDom(fieldId: string, page: string): FieldRecord | null {
  const el = getElementForField(fieldId);
  if (!el) return null;
  const meta = resolveFieldMeta(fieldId, page);
  const value = readValueFromElement(el, meta.type === 'markdown' ? 'markdown' : meta.type);
  return { meta, value, baseline: value, dirty: false };
}

export function cloneFieldValue(value: FieldValue): FieldValue {
  return JSON.parse(JSON.stringify(value)) as FieldValue;
}
