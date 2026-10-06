import { useCallback, useEffect, useMemo, useState } from 'react';
import { Film, ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { uploadSiteMedia } from '@/lib/siteMediaUpload';
import ResolvedMediaUrl from './ResolvedMediaUrl';
import { buildMediaCatalog } from './catalog';
import { registerLocalMedia } from './localIndex';
import type { MediaKind, MediaLibraryItem } from './types';

type Props = {
  open: boolean;
  kind: MediaKind;
  title?: string;
  pickerMode: boolean;
  onClose: () => void;
  onSelect: (item: MediaLibraryItem) => void;
};

export default function MediaLibraryModal({
  open,
  kind,
  title,
  pickerMode,
  onClose,
  onSelect,
}: Props) {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<MediaKind>(kind);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await buildMediaCatalog());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setTab(kind);
    setQuery('');
    void reload();
  }, [open, kind, reload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (item.kind !== tab) return false;
      if (!q) return true;
      return item.label.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
    });
  }, [items, query, tab]);

  const heading =
    title ??
    (pickerMode
      ? tab === 'video'
        ? 'اختر فيديو'
        : 'اختر صورة'
      : 'مكتبة الوسائط');

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} shouldScaleBackground={false}>
      <DrawerContent
        className="z-[10002] max-h-[92vh] border-white/10 bg-[#0f141c] text-white"
        data-edit-toolbar="true"
        dir="rtl"
      >
        <DrawerHeader className="border-b border-white/10 pb-3 text-right">
          <DrawerTitle className="text-base font-bold text-white">{heading}</DrawerTitle>
          <DrawerDescription className="text-[11px] text-white/50">
            {pickerMode ? 'انقر للاستبدال · اسحب للإغلاق' : 'تصفح أو ارفع وسائط جديدة'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
          <button
            type="button"
            onClick={() => setTab('image')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              tab === 'image' ? 'bg-gold/25 text-gold' : 'bg-white/5 text-white/70'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            صور
          </button>
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              tab === 'video' ? 'bg-gold/25 text-gold' : 'bg-white/5 text-white/70'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            فيديو
          </button>
          <div className="relative min-w-[10rem] flex-1">
            <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-8 text-sm text-white placeholder:text-white/35"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gold/20 px-3 py-1.5 text-xs font-bold text-gold">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'رفع…' : 'رفع'}
            <input
              type="file"
              accept={tab === 'video' ? 'video/*' : 'image/*'}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setUploading(true);
                void uploadSiteMedia(file)
                  .then((url) => {
                    const entry = registerLocalMedia({
                      url,
                      kind: tab,
                      label: file.name,
                      source: 'upload',
                    });
                    setItems((prev) => [entry, ...prev.filter((r) => r.url !== url)]);
                    const local = url.startsWith('idb://');
                    toast.success(local ? 'تم الحفظ محلياً (وضع التطوير)' : 'تمت الإضافة');
                    if (pickerMode) onSelect(entry);
                  })
                  .catch((err: unknown) => {
                    const msg = err instanceof Error ? err.message : 'فشل الرفع';
                    toast.error(msg);
                  })
                  .finally(() => setUploading(false));
              }}
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/55">لا توجد وسائط. ارفع ملفاً جديداً.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-right transition active:scale-[0.98] hover:border-gold/50"
                >
                  <div className="relative aspect-square bg-black/30">
                    <ResolvedMediaUrl
                      url={item.url}
                      kind={item.kind}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="line-clamp-1 px-1.5 py-1.5 text-[10px] font-medium text-white/80">{item.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
