import { FileText, History, Images, LayoutList, Paintbrush, Save, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useEditMode } from '@/contexts/EditModeContext';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenMedia: () => void;
  onOpenRevisions: () => void;
  onOpenBackground: () => void;
  onOpenPages: () => void;
  onOpenSections: () => void;
  onSave: () => void;
  onExitEditor: () => void;
};

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Images;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-right text-sm font-semibold text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
    >
      <Icon className="h-5 w-5 shrink-0 text-gold" />
      {label}
    </button>
  );
}

export default function EditorMoreSheet({
  open,
  onClose,
  onOpenMedia,
  onOpenRevisions,
  onOpenBackground,
  onOpenPages,
  onOpenSections,
  onSave,
  onExitEditor,
}: Props) {
  const { isDevEditModeAvailable, isEditMode } = useEditMode();
  const showSectionVisibility = isDevEditModeAvailable && isEditMode;

  const run = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} shouldScaleBackground={false}>
      <DrawerContent
        overlayClassName="z-[10110] bg-black/40 backdrop-blur-[3px]"
        className="z-[10120] max-h-[70vh] rounded-t-[20px] border-white/10 bg-[#f2f2f7] dark:bg-[#1c1c1e]"
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
            <DrawerTitle className="text-[17px] font-bold text-ink dark:text-white">المزيد</DrawerTitle>
            <span className="w-10" aria-hidden />
          </div>
        </DrawerHeader>
        <div className="space-y-0.5 px-2 pb-8">
          <MenuRow icon={Images} label="مكتبة الوسائط" onClick={() => run(onOpenMedia)} />
          <MenuRow icon={History} label="سجل التعديلات" onClick={() => run(onOpenRevisions)} />
          {showSectionVisibility ? (
            <MenuRow icon={LayoutList} label="ظهور الأقسام" onClick={() => run(onOpenSections)} />
          ) : null}
          <MenuRow icon={Paintbrush} label="خلفية الصفحة" onClick={() => run(onOpenBackground)} />
          <MenuRow icon={FileText} label="الصفحات" onClick={() => run(onOpenPages)} />
          <MenuRow icon={Save} label="حفظ الآن" onClick={() => run(onSave)} />
          <MenuRow icon={X} label="إغلاق وضع التحرير" onClick={() => run(onExitEditor)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
