import { client } from '@/lib/api';
import { homeImages, projectImages, sectorImages } from '@/config/assets';
import type { EamImageAsset } from '@/config/assets';
import type { MediaKind, MediaLibraryItem } from './types';
import { loadLocalMediaIndex } from './localIndex';

function assetRecordToItems(
  record: Record<string, EamImageAsset>,
  group: string,
): MediaLibraryItem[] {
  return Object.entries(record).map(([key, asset]) => ({
    id: `bundled-${group}-${key}`,
    url: asset.src,
    kind: 'image' as const,
    label: asset.alt || `${group} / ${key}`,
    source: 'bundled' as const,
  }));
}

function dedupeByUrl(items: MediaLibraryItem[]): MediaLibraryItem[] {
  const seen = new Set<string>();
  const out: MediaLibraryItem[] = [];
  for (const item of items) {
    if (!item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    out.push(item);
  }
  return out;
}

function inferKindFromUrl(url: string, editType: string): MediaKind {
  if (editType === 'video') return 'video';
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

async function fetchMediaFromSiteEdits(): Promise<MediaLibraryItem[]> {
  try {
    const response = await client.entities.site_edits.query({ limit: 2000 });
    const items = (response.data.items ?? []) as {
      id: number;
      element_key: string;
      edit_type: string;
      value: string;
    }[];
    return items
      .filter((row) => row.edit_type === 'image' || row.edit_type === 'video')
      .map((row) => ({
        id: `edit-${row.id}`,
        url: row.value,
        kind: inferKindFromUrl(row.value, row.edit_type),
        label: row.element_key,
        source: 'site-edit' as const,
      }));
  } catch {
    return [];
  }
}

/** Collect img/video src currently on the page (for quick re-use). */
function collectDomMedia(): MediaLibraryItem[] {
  if (typeof document === 'undefined') return [];
  const out: MediaLibraryItem[] = [];
  document.querySelectorAll('img[src]').forEach((node, index) => {
    const src = (node as HTMLImageElement).src;
    if (!src || src.startsWith('data:')) return;
    out.push({
      id: `dom-img-${index}-${src.slice(-24)}`,
      url: src,
      kind: 'image',
      label: node.getAttribute('alt') || 'صورة في الصفحة',
      source: 'page',
    });
  });
  document.querySelectorAll('video[src], video source[src]').forEach((node, index) => {
    const src =
      node.tagName === 'SOURCE'
        ? (node as HTMLSourceElement).src
        : (node as HTMLVideoElement).src;
    if (!src) return;
    out.push({
      id: `dom-vid-${index}-${src.slice(-24)}`,
      url: src,
      kind: 'video',
      label: 'فيديو في الصفحة',
      source: 'page',
    });
  });
  return out;
}

export async function buildMediaCatalog(): Promise<MediaLibraryItem[]> {
  const bundled = [
    ...assetRecordToItems(homeImages as Record<string, EamImageAsset>, 'home'),
    ...assetRecordToItems(sectorImages as Record<string, EamImageAsset>, 'sector'),
    ...assetRecordToItems(projectImages as Record<string, EamImageAsset>, 'project'),
  ];
  const local = loadLocalMediaIndex();
  const edits = await fetchMediaFromSiteEdits();
  const dom = collectDomMedia();
  return dedupeByUrl([...local, ...edits, ...dom, ...bundled]);
}
