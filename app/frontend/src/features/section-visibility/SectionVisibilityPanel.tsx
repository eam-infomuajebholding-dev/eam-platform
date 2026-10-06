import { useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { EditorIOSGroup } from '@/features/site-editor/components/EditorDrawerFrame';
import { useSectionVisibility } from './SectionVisibilityContext';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SectionVisibilityPanel({ open, onClose }: Props) {
  const { sections, isLoading, pagePath, setSectionState } = useSectionVisibility();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} shouldScaleBackground={false}>
      <DrawerContent
        overlayClassName="z-[10110] bg-black/40 backdrop-blur-[3px]"
        className="z-[10120] max-h-[85vh] rounded-t-[20px] border-white/10 bg-[#f2f2f7] dark:bg-[#1c1c1e]"
        data-edit-toolbar="true"
        dir="rtl"
      >
        <DrawerHeader className="border-b border-black/5 pb-3 text-right dark:border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-[17px] font-semibold text-[#007aff] dark:text-[#0a84ff]"
            >
              تم
            </button>
            <DrawerTitle className="text-[17px] font-bold text-ink dark:text-white">ظهور الأقسام</DrawerTitle>
            <span className="w-10" aria-hidden />
          </div>
          <DrawerDescription className="text-center text-[13px] text-ink-muted dark:text-white/55">
            {pagePath}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 pb-8">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : sections.length === 0 ? (
            <p className="py-8 text-center text-sm leading-relaxed text-ink-muted dark:text-white/60">
              لا توجد أقسام معرّفة على هذه الصفحة بعد. انتقل إلى صفحة من ⋯ → «الصفحات»، أو أضف{' '}
              <code className="text-white/80">data-page-section</code> على عناصر <code className="text-white/80">section</code>.
            </p>
          ) : (
            <EditorIOSGroup>
              {sections.map((section) => {
                const published = section.state === 'published';
                return (
                  <div
                    key={section.id}
                    className="flex items-center justify-between gap-3 px-4 py-3.5"
                  >
                    <div className="min-w-0 text-right">
                      <p className="text-[17px] font-medium text-ink dark:text-white">{section.label}</p>
                      <p className="font-mono text-[11px] text-ink-muted dark:text-white/40">{section.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void setSectionState(section.id, published ? 'hidden' : 'published')}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        published
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
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
                  </div>
                );
              })}
            </EditorIOSGroup>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
