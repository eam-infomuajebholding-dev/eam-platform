import { getStoredAuthToken } from '@/features/auth/utils/authTokenStorage';
import { client } from '@/lib/api';
import {
  deleteLocalEdit,
  isLocalEditId,
  loadLocalEditsForPage,
  mergeEditsForPage,
  type SiteEditRow,
  upsertLocalEdit,
} from '@/lib/localSiteEdits';
import { HOME_STACK_EDITOR_PAGES, siteEditorPageKey } from '@/features/site-editor/siteEditorPageKey';

export type SiteEdit = SiteEditRow;

const editsCache: Map<string, SiteEdit[]> = new Map();

function shouldAttemptRemoteSiteEditsWrite(): boolean {
  if (!import.meta.env.DEV) return true;
  return Boolean(getStoredAuthToken());
}

async function saveEditRemote(
  page: string,
  element_key: string,
  edit_type: string,
  value: string,
  cached: SiteEdit[],
  existing: SiteEdit | undefined,
): Promise<void> {
  if (existing && !isLocalEditId(existing.id)) {
    await client.entities.site_edits.update({
      id: String(existing.id),
      data: { value, edit_type },
    });
    existing.value = value;
    existing.edit_type = edit_type;
    editsCache.set(page, cached);
    return;
  }

  const response = await client.entities.site_edits.create({
    data: { page, element_key, edit_type, value },
  });
  const newEdit: SiteEdit = response.data as SiteEdit;
  const withoutDup = cached.filter((e) => e.element_key !== element_key);
  withoutDup.push(newEdit);
  editsCache.set(page, withoutDup);
}

function saveEditLocal(
  page: string,
  element_key: string,
  edit_type: string,
  value: string,
  cached: SiteEdit[],
): void {
  try {
    const row = upsertLocalEdit(page, element_key, edit_type, value);
    const withoutDup = cached.filter((e) => e.element_key !== element_key);
    withoutDup.push(row);
    editsCache.set(page, withoutDup);
  } catch (error) {
    console.error('Local save failed (storage quota?):', error);
    throw new Error('تعذر الحفظ محلياً — قد يكون التخزين ممتلئاً');
  }
}

function homeStackAliasPages(page: string): string[] {
  const key = siteEditorPageKey(page);
  return key === '/' ? [...HOME_STACK_EDITOR_PAGES] : [key];
}

export async function loadEditsForPage(page: string): Promise<SiteEdit[]> {
  const key = siteEditorPageKey(page);
  if (editsCache.has(key)) {
    return editsCache.get(key)!;
  }

  const aliasPages = homeStackAliasPages(page);
  let remote: SiteEdit[] = [];
  const remoteByKey = new Map<string, SiteEdit>();
  for (const alias of aliasPages) {
    try {
      const response = await client.entities.site_edits.query({
        query: { page: alias },
        limit: 2000,
      });
      const items = (response.data.items as SiteEdit[]) || [];
      for (const row of items) {
        remoteByKey.set(row.element_key, row);
      }
    } catch (error) {
      console.warn('Failed to load remote edits for page:', alias, error);
    }
  }
  remote = [...remoteByKey.values()];

  const localByKey = new Map<string, SiteEdit>();
  for (const alias of aliasPages) {
    for (const row of loadLocalEditsForPage(alias)) {
      localByKey.set(row.element_key, row);
    }
  }
  const merged = mergeEditsForPage(remote, [...localByKey.values()]);
  editsCache.set(key, merged);
  return merged;
}

export async function saveEdit(
  page: string,
  element_key: string,
  edit_type: string,
  value: string,
): Promise<'remote' | 'local'> {
  const key = siteEditorPageKey(page);
  const cached = editsCache.get(key) ?? (await loadEditsForPage(page));
  const existing = cached.find((e) => e.element_key === element_key);

  if (shouldAttemptRemoteSiteEditsWrite()) {
    try {
      await saveEditRemote(key, element_key, edit_type, value, cached, existing);
      return 'remote';
    } catch (error) {
      console.warn('Remote save failed:', error);
      if (!import.meta.env.DEV) {
        throw error;
      }
    }
  }

  saveEditLocal(key, element_key, edit_type, value, cached);
  editsCache.set(key, cached);
  return 'local';
}

export async function deleteEdit(id: number): Promise<void> {
  if (isLocalEditId(id)) {
    deleteLocalEdit(id);
    for (const [page, edits] of editsCache.entries()) {
      const idx = edits.findIndex((e) => e.id === id);
      if (idx !== -1) {
        edits.splice(idx, 1);
        editsCache.set(page, edits);
        break;
      }
    }
    return;
  }

  try {
    await client.entities.site_edits.delete({ id: String(id) });
    for (const [page, edits] of editsCache.entries()) {
      const idx = edits.findIndex((e) => e.id === id);
      if (idx !== -1) {
        edits.splice(idx, 1);
        editsCache.set(page, edits);
        break;
      }
    }
  } catch (error) {
    console.error('Failed to delete edit:', error);
    throw error;
  }
}

export async function uploadMedia(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const object_key = `edits/${timestamp}-${safeName}`;

  try {
    await client.storage.upload({
      bucket_name: 'site-media',
      object_key,
      file,
    });

    const urlResponse = await client.storage.getDownloadUrl({
      bucket_name: 'site-media',
      object_key,
    });

    return urlResponse.data.download_url as string;
  } catch (error) {
    console.error('Failed to upload media:', error);
    throw error;
  }
}

export function invalidateCache(page?: string): void {
  if (page) {
    const key = siteEditorPageKey(page);
    editsCache.delete(key);
    if (key === '/') {
      editsCache.delete('/services/platforms');
    }
  } else {
    editsCache.clear();
  }
}
