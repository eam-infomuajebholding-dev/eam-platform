import { useCallback, useEffect, useState } from 'react';
import { History, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { deleteEdit, invalidateCache, loadEditsForPage } from '@/lib/dbService';
import { applySavedEdits } from './InlineEditable';

type SiteEditRow = {
  id: number;
  element_key: string;
  edit_type: string;
  value: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PageEditsPanel({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<SiteEditRow[]>([]);
  const page = typeof window !== 'undefined' ? window.location.pathname : '/';

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      invalidateCache(page);
      const edits = await loadEditsForPage(page);
      setRows(edits);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const highlight = (elementKey: string) => {
    const el = document.querySelector(`[data-editable-id="${elementKey}"]`) as HTMLElement | null;
    if (!el) {
      toast.message('لم يُعثر على العنصر في الصفحة الحالية');
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.outline = '3px solid #D3B051';
    el.style.outlineOffset = '4px';
    window.setTimeout(() => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }, 2000);
  };

  const remove = async (id: number) => {
    try {
      await deleteEdit(id);
      toast.success('تم حذف التعديل — سيتم استعادة النص الافتراضي بعد التحديث');
      await refresh();
      invalidateCache(page);
      window.location.reload();
    } catch {
      toast.error('تعذر حذف التعديل');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center" data-edit-toolbar="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="إغلاق" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-gold/25 bg-[#1a1a2e] text-white shadow-2xl sm:rounded-2xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold" aria-hidden />
            <div>
              <p className="text-sm font-bold">تعديلات هذه الصفحة</p>
              <p className="font-mono text-[10px] text-white/50 ltr:unicode-bidi-plaintext">{page}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/60">لا توجد تعديلات محفوظة لهذه الصفحة.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => highlight(row.element_key)}
                      className="text-right font-mono text-xs text-gold-300 hover:underline"
                    >
                      {row.element_key}
                    </button>
                    <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase">
                      {row.edit_type}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-white/70 ltr:unicode-bidi-plaintext" dir="auto">
                    {row.value}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void remove(row.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-3 w-3" />
                      حذف واستعادة
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={() => void applySavedEdits()}
            className="w-full rounded-lg border border-gold/40 py-2 text-xs font-semibold text-gold hover:bg-gold/10"
          >
            إعادة تطبيق التعديلات على الصفحة
          </button>
        </div>
      </div>
    </div>
  );
}
