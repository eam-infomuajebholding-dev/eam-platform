import { useCallback, useEffect, useMemo, useState } from 'react';
import { Film, ImageIcon, Loader2, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';
import { uploadMedia } from '@/lib/dbService';
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

async function uploadFile(file: File): Promise<string> {
  if (isCloudinaryConfigured()) {
    try {
      return await uploadToCloudinary(file);
    } catch {
      /* fallback */
    }
  }
  return uploadMedia(file);
}

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

  if (!open) return null;

  const heading =
    title ??
    (pickerMode
      ? tab === 'video'
        ? 'اختر فيديو من المكتبة'
        : 'اختر صورة من المكتبة'
      : 'مكتبة الوسائط');

  return (
    <div className="fixed inset-0 z-[10002] flex items-end justify-center sm:items-center" data-edit-toolbar="true">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="إغلاق" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-[#0f141c] text-white shadow-2xl sm:rounded-2xl"
        dir="rtl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-base font-bold">{heading}</p>
            <p className="text-[11px] text-white/50">
              {pickerMode ? 'انقر العنصر لاستبدال الوسيط الحالي' : 'تصفح وارفع وسائط الموقع'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

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
          <div className="relative min-w-[12rem] flex-1">
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
            {uploading ? 'رفع…' : 'رفع جديد'}
            <input
              type="file"
              accept={tab === 'video' ? 'video/*' : 'image/*'}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setUploading(true);
                void uploadFile(file)
                  .then((url) => {
                    const entry = registerLocalMedia({
                      url,
                      kind: tab,
                      label: file.name,
                      source: 'upload',
                    });
                    setItems((prev) => [entry, ...prev.filter((r) => r.url !== url)]);
                    toast.success('تمت إضافة الملف إلى المكتبة');
                    if (pickerMode) onSelect(entry);
                  })
                  .catch(() => toast.error('فشل الرفع'))
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
            <p className="py-16 text-center text-sm text-white/55">لا توجد وسائط من هذا النوع. ارفع ملفاً جديداً.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-right transition hover:border-gold/50 hover:ring-2 hover:ring-gold/30"
                >
                  <div className="relative aspect-[4/3] bg-black/30">
                    {item.kind === 'video' ? (
                      <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] uppercase text-white/80">
                      {item.source}
                    </span>
                  </div>
                  <p className="line-clamp-2 px-2 py-2 text-[11px] font-medium text-white/85">{item.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
