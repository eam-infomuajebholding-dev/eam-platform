import { useCallback, useEffect, useState } from 'react';
import { History, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { invalidateCache, loadEditsForPage } from '@/lib/dbService';
import { removePersistedField } from '../persistence';
import { useSiteEditor } from '../context/SiteEditorContext';

type Props = { open: boolean; onClose: () => void };

export default function EditorRevisionsPanel({ open, onClose }: Props) {
  const { pagePath, reloadDocument } = useSiteEditor();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<
    { id: number; element_key: string; edit_type: string; value: string; updated_at?: string }[]
  >([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      invalidateCache(pagePath);
      const edits = await loadEditsForPage(pagePath);
      setRows(edits);
    } finally {
      setLoading(false);
    }
  }, [pagePath]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center" data-edit-toolbar="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="إغلاق" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-[#1a1a2e] text-white shadow-2xl sm:rounded-2xl" dir="rtl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold" />
            <div>
              <p className="text-sm font-bold">سجل التعديلات</p>
              <p className="font-mono text-[10px] text-white/50">{pagePath}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/60">لا توجد نسخ محفوظة.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li key={row.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="font-mono text-xs text-gold-300">{row.element_key}</span>
                    <span className="text-[10px] uppercase text-white/50">{row.edit_type}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-white/70" dir="auto">
                    {row.value}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void removePersistedField(row.id, pagePath).then(() => {
                        toast.success('تم الحذف — جارٍ التحديث');
                        window.location.reload();
                      })
                    }
                    className="mt-2 inline-flex items-center gap-1 text-xs text-red-300 hover:underline"
                  >
                    <Trash2 className="h-3 w-3" />
                    حذف واستعادة الافتراضي
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void reloadDocument()}
            className="w-full rounded-lg border border-gold/40 py-2 text-xs font-semibold text-gold"
          >
            إعادة تحميل المستند من الخادم
          </button>
        </div>
      </div>
    </div>
  );
}
