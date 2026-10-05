import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useSectionVisibility } from './SectionVisibilityContext';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SectionVisibilityPanel({ open, onClose }: Props) {
  const { sections, isLoading, pagePath, setSectionState } = useSectionVisibility();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center" data-edit-toolbar="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="إغلاق" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-[#1a1a2e] text-white shadow-2xl sm:rounded-2xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm font-bold">إدارة ظهور الأقسام</p>
            <p className="text-[11px] text-white/55">طوّر جزئياً — انشر للزوار عند الجاهزية</p>
            <p className="font-mono text-[10px] text-white/40">{pagePath}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : sections.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/60">
              لا توجد أقسام مسجّلة لهذه الصفحة. أضفها في{' '}
              <code className="text-gold-300">section-visibility/registry.ts</code>.
            </p>
          ) : (
            <ul className="space-y-2">
              {sections.map((section) => {
                const published = section.state === 'published';
                return (
                  <li
                    key={section.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{section.label}</p>
                      <p className="font-mono text-[10px] text-white/45">{section.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void setSectionState(section.id, published ? 'hidden' : 'published')}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        published
                          ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
                      }`}
                    >
                      {published ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          منشور
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          مخفي
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="border-t border-white/10 px-4 py-2 text-center text-[10px] text-white/45">
          الأقسام «المخفية» تظهر لك فقط في وضع التحرير مع شريط تنبيه.
        </p>
      </div>
    </div>
  );
}
