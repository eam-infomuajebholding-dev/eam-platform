import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Mic } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HomeMessageKey } from '@/i18n/homeMessages';

type AssistantHoldToTalkMicProps = {
  disabled?: boolean;
  isListening: boolean;
  cancelArmed: boolean;
  onHoldStart: (clientX: number) => void | Promise<void>;
  onHoldMove: (clientX: number) => void;
  onHoldEnd: (cancelArmed: boolean) => void | Promise<void>;
  className?: string;
  iconClassName?: string;
  ariaLabel: string;
  holdHintKey?: HomeMessageKey;
};

/** Press-and-hold mic control (WhatsApp-style). */
export default function AssistantHoldToTalkMic({
  disabled = false,
  isListening,
  cancelArmed,
  onHoldStart,
  onHoldMove,
  onHoldEnd,
  className = '',
  iconClassName = 'h-4 w-4',
  ariaLabel,
  holdHintKey = 'chat.voiceHoldHint',
}: AssistantHoldToTalkMicProps) {
  const { t } = useLanguage();
  const holdingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const holdStartedAtRef = useRef(0);

  const finishHold = (cancel: boolean) => {
    if (!holdingRef.current) {
      return;
    }
    const tooShort = Date.now() - holdStartedAtRef.current < 350;
    holdingRef.current = false;
    pointerIdRef.current = null;
    void onHoldEnd(cancel || tooShort);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) {
      return;
    }
    event.preventDefault();
    holdingRef.current = true;
    holdStartedAtRef.current = Date.now();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    void onHoldStart(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!holdingRef.current || pointerIdRef.current !== event.pointerId) {
      return;
    }
    onHoldMove(event.clientX);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    finishHold(cancelArmed);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    finishHold(true);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`touch-none select-none ${className}`}
      aria-label={isListening ? t('chat.voiceRecording') : ariaLabel}
      title={!isListening ? t(holdHintKey) : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Mic
        className={`${iconClassName} ${isListening ? 'animate-pulse' : ''} ${
          cancelArmed ? 'text-red-500' : ''
        }`}
      />
    </button>
  );
}
