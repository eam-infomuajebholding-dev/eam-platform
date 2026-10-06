import { deleteEdit, invalidateCache, loadEditsForPage, saveEdit } from '@/lib/dbService';
import { parseStoredValue, serializeFieldValue } from './serialization';
import type { FieldRecord, FieldValue } from './types';
import { resolveFieldMeta } from './fieldRegistry';
import {
  applyLegacyEditsFromRows,
  ensureHomeHeroDefaults,
  ensureHomeSectionImageDefaults,
  readValueFromElement,
  resolveElementForField,
  stampEditableId,
} from './domApply';
import { HOME_STACK_EDITOR_PAGES, siteEditorPageKey } from './siteEditorPageKey';

const HOME_SECTION_2_3_IDS = new Set(['home-about-eam-image', 'home-one-statement-image']);
const HOME_S23_RESTORE_KEY = 'eam-home-s2-s3-images-restored-v3';
const PROTECTED_HOME_IMAGE_IDS = new Set([
  'home-hero-bg-image',
  'home-about-eam-image',
  'home-one-statement-image',
]);
const HOME_HERO_RESTORE_KEY = 'eam-home-hero-restored-v1';
const HOME_HERO_FIELD_IDS = new Set(['home-hero-bg-image']);

function legacyRowTargetsHomeSection23(row: {
  element_key: string;
  edit_type: string;
  value: string;
}): boolean {
  if (HOME_SECTION_2_3_IDS.has(row.element_key)) return true;
  if (row.edit_type !== 'image' || !row.element_key.startsWith('img-')) return false;
  if (isEmptyStoredImage(row)) return true;
  const v = row.value.toLowerCase();
  return (
    v.includes('about-eam') ||
    v.includes('one-statement') ||
    v.includes('02-home-about') ||
    v.includes('02-home-one-statement')
  );
}

function legacyRowTargetsHomeHero(row: {
  element_key: string;
  edit_type: string;
  value: string;
}): boolean {
  if (HOME_HERO_FIELD_IDS.has(row.element_key)) return true;
  if (row.edit_type !== 'image' && row.edit_type !== 'video') return false;
  const v = row.value.toLowerCase();
  if (!row.element_key.startsWith('img-') && !row.element_key.startsWith('video-')) {
    return false;
  }
  return (
    v.includes('01-home-hero') ||
    v.includes('home-hero') ||
    v.includes('about-cinematic') ||
    v.includes('eam-emblem')
  );
}

/** One-time: reset hero overrides so `/` matches the platforms homepage hero. */
async function migrateRestoreHomeHero(_page: string) {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(HOME_HERO_RESTORE_KEY)) return;

  for (const stackPage of HOME_STACK_EDITOR_PAGES) {
    const rows = await loadEditsForPage(stackPage);
    for (const row of rows) {
      if (!legacyRowTargetsHomeHero(row)) continue;
      try {
        await deleteEdit(row.id);
      } catch {
        /* ignore */
      }
    }
    invalidateCache(stackPage);
  }

  window.localStorage.setItem(HOME_HERO_RESTORE_KEY, '1');
  invalidateCache('/');
}

/** One-time: clear overrides so bundled art shows for sections 2 & 3 (incl. accidental cut/autosave). */
async function migrateRestoreHomeSectionsTwoAndThree(page: string) {
  if (siteEditorPageKey(page) !== '/' || typeof window === 'undefined') return;
  if (window.localStorage.getItem(HOME_S23_RESTORE_KEY)) return;

  for (const stackPage of HOME_STACK_EDITOR_PAGES) {
    const rows = await loadEditsForPage(stackPage);
    for (const row of rows) {
      if (!legacyRowTargetsHomeSection23(row)) continue;
      try {
        await deleteEdit(row.id);
      } catch {
        /* ignore */
      }
    }
    invalidateCache(stackPage);
  }

  window.localStorage.setItem(HOME_S23_RESTORE_KEY, '1');
  invalidateCache('/');
}

function isEmptyStoredImage(row: { edit_type: string; value: string }): boolean {
  if (row.edit_type !== 'image') return false;
  const value = parseStoredValue('image', row.value, 'image');
  return value.type === 'image' && !value.url?.trim();
}

/** Drop broken image overrides (e.g. accidental delete) and restore bundled assets on apply. */
async function pruneEmptyImageEdits(page: string, rows: { id: number; edit_type: string; value: string }[]) {
  for (const row of rows) {
    if (!isEmptyStoredImage(row)) continue;
    try {
      await deleteEdit(row.id);
    } catch {
      /* ignore */
    }
  }
  invalidateCache(page);
}

export async function restoreFieldToDefault(
  page: string,
  fieldId: string,
  persistedId?: number,
): Promise<void> {
  if (persistedId != null) {
    await deleteEdit(persistedId);
  }
  invalidateCache(page);
  const el = resolveElementForField(fieldId);
  const def = el?.getAttribute('data-editor-default-src');
  if (el && def && el.tagName === 'IMG') {
    (el as HTMLImageElement).src = def;
  }
}

export async function loadPageFieldRecords(page: string): Promise<Record<string, FieldRecord>> {
  const storagePage = siteEditorPageKey(page);
  invalidateCache(storagePage);
  let rows = await loadEditsForPage(storagePage);
  const emptyImages = rows.filter(isEmptyStoredImage);
  if (emptyImages.length > 0) {
    await pruneEmptyImageEdits(storagePage, emptyImages);
    invalidateCache(storagePage);
    rows = await loadEditsForPage(storagePage);
  }

  const records: Record<string, FieldRecord> = {};

  for (const row of rows) {
    if (isEmptyStoredImage(row)) continue;
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
  ensureHomeSectionImageDefaults();

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

export async function persistField(
  page: string,
  fieldId: string,
  record: FieldRecord,
): Promise<{ id?: number; storage: 'remote' | 'local' }> {
  const storagePage = siteEditorPageKey(page);
  if (
    PROTECTED_HOME_IMAGE_IDS.has(fieldId) &&
    record.value.type === 'image' &&
    !record.value.url?.trim()
  ) {
    if (record.persistedId != null) {
      try {
        await deleteEdit(record.persistedId);
      } catch {
        /* ignore */
      }
    }
    invalidateCache(storagePage);
    ensureHomeSectionImageDefaults();
    return { id: undefined, storage: 'local' };
  }

  const { edit_type, value } = serializeFieldValue(record.meta.type, record.value);
  const storage = await saveEdit(storagePage, fieldId, edit_type, value);
  const rows = await loadEditsForPage(storagePage);
  const match = rows.find((r) => r.element_key === fieldId);
  return { id: match?.id, storage };
}

export async function removePersistedField(id: number, page: string): Promise<void> {
  await deleteEdit(id);
  invalidateCache(page);
}

export async function applySavedEditsForRoute(page: string = window.location.pathname) {
  const storagePage = siteEditorPageKey(page);
  await migrateRestoreHomeHero(page);
  await migrateRestoreHomeSectionsTwoAndThree(page);
  invalidateCache(storagePage);
  let rows = await loadEditsForPage(storagePage);
  const emptyImages = rows.filter(isEmptyStoredImage);
  if (emptyImages.length > 0) {
    await pruneEmptyImageEdits(storagePage, emptyImages);
    invalidateCache(storagePage);
    rows = await loadEditsForPage(storagePage);
  }

  const run = () => {
    void applyLegacyEditsFromRows(rows);
    ensureHomeHeroDefaults();
    ensureHomeSectionImageDefaults();
  };
  run();
  window.setTimeout(run, 300);
  window.setTimeout(run, 900);
}

export function bootstrapFieldFromDom(
  fieldId: string,
  page: string,
  elementHint?: HTMLElement | null,
): FieldRecord | null {
  const el = resolveElementForField(fieldId, elementHint);
  if (!el) return null;
  stampEditableId(el, fieldId);
  const meta = resolveFieldMeta(fieldId, page);
  const value = readValueFromElement(el, meta.type === 'markdown' ? 'markdown' : meta.type);
  return { meta, value, baseline: value, dirty: false };
}

export function cloneFieldValue(value: FieldValue): FieldValue {
  return JSON.parse(JSON.stringify(value)) as FieldValue;
}
