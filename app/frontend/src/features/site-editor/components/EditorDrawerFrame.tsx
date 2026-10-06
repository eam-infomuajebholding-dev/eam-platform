import { useEffect, type ReactNode } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const EDITOR_OVERLAY = 'z-[10110] bg-black/40 backdrop-blur-[3px]';
const EDITOR_SHEET = 'z-[10120] max-h-[88vh] rounded-t-[20px] border-white/10 bg-[#f2f2f7] text-ink dark:bg-[#1c1c1e] dark:text-white';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

/** iOS-style bottom sheet chrome for the site editor (Done, Escape, swipe dismiss). */
export default function EditorDrawerFrame({ open, onClose, title, description, children }: Props) {
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
        overlayClassName={EDITOR_OVERLAY}
        className={EDITOR_SHEET}
        data-edit-toolbar="true"
        dir="rtl"
      >
        <DrawerHeader className="border-b border-black/5 px-4 pb-3 pt-1 text-right dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[3rem] rounded-lg py-1 text-left text-[17px] font-semibold text-[#007aff] dark:text-[#0a84ff]"
            >
              تم
            </button>
            <DrawerTitle className="flex-1 text-center text-[17px] font-bold tracking-tight">{title}</DrawerTitle>
            <span className="min-w-[3rem]" aria-hidden />
          </div>
          {description ? (
            <DrawerDescription className="mt-1 text-center text-[13px] text-ink-muted dark:text-white/55">
              {description}
            </DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 pb-8">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

export function EditorIOSGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      {title ? (
        <p className="mb-1.5 px-3 text-[13px] font-medium text-ink-muted dark:text-white/45">{title}</p>
      ) : null}
      <div className="overflow-hidden rounded-[12px] bg-white shadow-sm dark:bg-[#2c2c2e]">
        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">{children}</div>
      </div>
    </div>
  );
}

export function EditorIOSRow({
  label,
  detail,
  onClick,
  active,
  chevron = true,
}: {
  label: string;
  detail?: string;
  onClick: () => void;
  active?: boolean;
  chevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-right transition active:bg-black/5 dark:active:bg-white/10 ${
        active ? 'bg-gold/10' : ''
      }`}
    >
      <span className={`min-w-0 flex-1 text-[17px] ${active ? 'font-semibold text-gold-700 dark:text-gold' : ''}`}>
        {label}
      </span>
      {detail ? <span className="truncate text-[15px] text-ink-muted dark:text-white/45">{detail}</span> : null}
      {chevron ? (
        <span className="text-ink-muted dark:text-white/35" aria-hidden>
          ‹
        </span>
      ) : null}
    </button>
  );
}
