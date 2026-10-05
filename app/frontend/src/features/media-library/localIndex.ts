import type { MediaKind, MediaLibraryItem } from './types';

const STORAGE_KEY = 'eam-media-library-v1';

export function loadLocalMediaIndex(): MediaLibraryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MediaLibraryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function registerLocalMedia(item: {
  url: string;
  kind: MediaKind;
  label: string;
  source?: MediaLibraryItem['source'];
}): MediaLibraryItem {
  const entry: MediaLibraryItem = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: item.url,
    kind: item.kind,
    label: item.label,
    source: item.source ?? 'upload',
  };
  const list = loadLocalMediaIndex().filter((row) => row.url !== entry.url);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 400)));
  return entry;
}
