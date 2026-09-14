import { Copy, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type AssistantWindowControlsProps = {
  minimized: boolean;
  onMinimize: () => void;
  onRestore: () => void;
};

/** Window-style minimize / restore controls (— and overlapping squares). */
export default function AssistantWindowControls({
  minimized,
  onMinimize,
  onRestore,
}: AssistantWindowControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <button
        type="button"
        onClick={onMinimize}
        disabled={minimized}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--eam-home-ink)]/75 transition hover:bg-[var(--eam-home-cream)] hover:text-[var(--eam-home-ink)] disabled:pointer-events-none disabled:opacity-30"
        aria-label={t('assistant.minimize')}
        title={t('assistant.minimize')}
      >
        <Minus className="h-4 w-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={onRestore}
        disabled={!minimized}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--eam-home-ink)]/75 transition hover:bg-[var(--eam-home-cream)] hover:text-[var(--eam-home-ink)] disabled:pointer-events-none disabled:opacity-30"
        aria-label={t('assistant.restore')}
        title={t('assistant.restore')}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
