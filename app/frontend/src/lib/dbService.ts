import { client } from '@/lib/api';

interface SiteEdit {
  id: number;
  page: string;
  element_key: string;
  edit_type: string;
  value: string;
}

// In-memory cache keyed by page path
const editsCache: Map<string, SiteEdit[]> = new Map();

/**
 * Load all site edits for a given page from the database.
 * Uses an in-memory cache to avoid repeated queries.
 */
export async function loadEditsForPage(page: string): Promise<SiteEdit[]> {
  // Return cached data if available
  if (editsCache.has(page)) {
    return editsCache.get(page)!;
  }

  try {
    const response = await client.entities.site_edits.query({
      query: { page },
      limit: 2000,
    });
    const items: SiteEdit[] = response.data.items || [];
    editsCache.set(page, items);
    return items;
  } catch (error) {
    console.error('Failed to load edits for page:', page, error);
    return [];
  }
}

/**
 * Save or update an edit in the database.
 * If an edit with the same page + element_key exists, update it.
 * Otherwise, create a new one.
 */
export async function saveEdit(
  page: string,
  element_key: string,
  edit_type: string,
  value: string
): Promise<void> {
  try {
    // Check cache first for existing edit
    const cached = editsCache.get(page) || [];
    const existing = cached.find(
      (e) => e.element_key === element_key
    );

    if (existing) {
      // Update existing edit
      await client.entities.site_edits.update({
        id: String(existing.id),
        data: { value, edit_type },
      });
      // Update cache
      existing.value = value;
      existing.edit_type = edit_type;
    } else {
      // Create new edit
      const response = await client.entities.site_edits.create({
        data: { page, element_key, edit_type, value },
      });
      const newEdit: SiteEdit = response.data;
      cached.push(newEdit);
      editsCache.set(page, cached);
    }
  } catch (error) {
    console.error('Failed to save edit:', error);
    throw error;
  }
}

/**
 * Delete an edit from the database by ID.
 */
export async function deleteEdit(id: number): Promise<void> {
  try {
    await client.entities.site_edits.delete({ id: String(id) });
    // Remove from cache
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

/**
 * Upload a media file to object storage bucket "site-media".
 * Returns the download URL for the uploaded file.
 */
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

    return urlResponse.data.download_url;
  } catch (error) {
    console.error('Failed to upload media:', error);
    throw error;
  }
}

/**
 * Invalidate the cache for a specific page (useful after bulk operations).
 */
export function invalidateCache(page?: string): void {
  if (page) {
    editsCache.delete(page);
  } else {
    editsCache.clear();
  }
}