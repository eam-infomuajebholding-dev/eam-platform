import { getStoredAuthToken } from '@/features/auth/utils/authTokenStorage';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';
import { uploadMedia } from '@/lib/dbService';
import { saveFileToIDB, saveMediaToIDB } from '@/lib/mediaStorage';

const MAX_INLINE_DATA_URL = 2.5 * 1024 * 1024;
const MAX_IDB_BLOB = 48 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function newLocalMediaKey(file: File): string {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 48);
  return `media-${Date.now()}-${safe}-${Math.random().toString(36).slice(2, 8)}`;
}

async function saveLocally(file: File): Promise<string> {
  const key = newLocalMediaKey(file);
  if (file.size > MAX_IDB_BLOB) {
    throw new Error('حجم الملف أكبر من الحد المسموح للحفظ المحلي (48MB)');
  }
  if (file.type.startsWith('image/') && file.size <= MAX_INLINE_DATA_URL) {
    const dataUrl = await readFileAsDataUrl(file);
    await saveMediaToIDB(key, dataUrl);
    return `idb://${key}`;
  }
  await saveFileToIDB(key, file);
  return `idb://${key}`;
}

/**
 * Upload site media: Cloudinary → authenticated API storage → local IndexedDB (dev / offline).
 */
export async function uploadSiteMedia(file: File): Promise<string> {
  if (isCloudinaryConfigured()) {
    try {
      return await uploadToCloudinary(file);
    } catch (error) {
      console.warn('[uploadSiteMedia] Cloudinary failed', error);
    }
  }

  if (getStoredAuthToken()) {
    try {
      return await uploadMedia(file);
    } catch (error) {
      console.warn('[uploadSiteMedia] API storage failed', error);
    }
  }

  return saveLocally(file);
}
