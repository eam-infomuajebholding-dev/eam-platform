import { Trash2 } from 'lucide-react';
import { formatVoiceRecordingClock } from '@/hooks/useAssistantVoiceInput';
import { useLanguage } from '@/contexts/LanguageContext';

type AssistantVoiceRecordingBarProps = {
  recordingMs: number;
  cancelArmed: boolean;
  previewText?: string;
  compact?: boolean;
};

/** In-composer recording strip while the user holds the mic (WhatsApp-style). */
export default function AssistantVoiceRecordingBar({
  recordingMs,
  cancelArmed,
  previewText,
  compact = false,
}: AssistantVoiceRecordingBarProps) {
  const { t, direction } = useLanguage();
  const slideHint =
    direction === 'rtl' ? t('chat.voiceSlideToCancelRtl') : t('chat.voiceSlideToCancel');

  return (
    <div
      className={`flex min-h-[48px] flex-1 items-center gap-2 rounded-xl border px-3 ${
        cancelArmed
          ? 'border-red-300/80 bg-red-50 dark:border-red-900/50 dark:bg-red-950/25'
          : 'border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/60 dark:border-white/10 dark:bg-white/5'
      } ${compact ? 'min-h-[40px] px-2' : ''}`}
      role="status"
      aria-live="polite"
    >
      <Trash2
        className={`h-4 w-4 shrink-0 transition-transform ${
          cancelArmed ? 'scale-110 text-red-600' : 'text-[var(--eam-home-ink)]/35'
        }`}
        aria-hidden
      />
      <div className="min-w-0 flex-1 text-center">
        <p
          className={`truncate text-[11px] font-medium ${
            cancelArmed ? 'text-red-700 dark:text-red-300' : 'text-[var(--eam-home-ink)]/65'
          }`}
        >
          {cancelArmed ? t('chat.voiceReleaseToCancel') : slideHint}
        </p>
        {previewText ? (
          <p className="truncate text-[10px] text-[var(--eam-home-ink)]/50 dark:text-white/50">
            {previewText}
          </p>
        ) : null}
      </div>
      <span
        className={`shrink-0 text-[11px] font-semibold tabular-nums ${
          cancelArmed ? 'text-red-600' : 'text-red-500'
        }`}
      >
        {formatVoiceRecordingClock(recordingMs)}
      </span>
      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
    </div>
  );
}
