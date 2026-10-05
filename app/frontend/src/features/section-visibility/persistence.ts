import { invalidateCache, loadEditsForPage, saveEdit } from '@/lib/dbService';
import type { SectionPublishState } from './registry';
import { parseSectionStorageKey, sectionStorageKey } from './registry';

export async function loadSectionVisibilityMap(page: string): Promise<Record<string, SectionPublishState>> {
  const rows = await loadEditsForPage(page);
  const map: Record<string, SectionPublishState> = {};
  for (const row of rows) {
    if (row.edit_type !== 'visibility') continue;
    const sectionId = parseSectionStorageKey(row.element_key);
    if (!sectionId) continue;
    map[sectionId] = row.value === 'hidden' ? 'hidden' : 'published';
  }
  return map;
}

export async function persistSectionVisibility(
  page: string,
  sectionId: string,
  state: SectionPublishState,
): Promise<void> {
  await saveEdit(page, sectionStorageKey(sectionId), 'visibility', state);
  invalidateCache(page);
}
