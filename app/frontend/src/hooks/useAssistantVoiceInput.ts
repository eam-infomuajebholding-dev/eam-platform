import { useCallback, useEffect, useRef, useState } from 'react';
import type { HomeMessageKey } from '@/i18n/homeMessages';

export type VoiceTranscriptMeta = {
  isFinal: boolean;
};

type UseAssistantVoiceInputOptions = {
  language: string;
  disabled?: boolean;
  onTranscript: (text: string, meta: VoiceTranscriptMeta) => void;
  onListenStart?: () => void;
  t: (key: HomeMessageKey) => string;
};

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error' | 'hint';

type HoldEndRequest = {
  cancel: boolean;
  resolve: (text: string) => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const win = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function resolveRecognitionLang(language: string): string {
  if (language.startsWith('ar')) {
    return 'ar-SA';
  }
  if (language.startsWith('en')) {
    return 'en-US';
  }
  return language;
}

function readAllTranscript(recognition: SpeechRecognition | null): string {
  if (!recognition?.results?.length) {
    return '';
  }
  let combined = '';
  for (let i = 0; i < recognition.results.length; i += 1) {
    const piece = recognition.results[i]?.[0]?.transcript ?? '';
    if (piece) {
      combined += piece;
    }
  }
  return combined.trim();
}

/** WhatsApp-style hold-to-talk speech recognition for the assistant composer. */
export function useAssistantVoiceInput({
  language,
  disabled = false,
  onTranscript,
  onListenStart,
  t,
}: UseAssistantVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [recordingMs, setRecordingMs] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionActiveRef = useRef(false);
  const sessionCommittedRef = useRef('');
  const sessionInterimRef = useRef('');
  const holdEndQueueRef = useRef<HoldEndRequest | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onListenStartRef = useRef(onListenStart);
  onTranscriptRef.current = onTranscript;
  onListenStartRef.current = onListenStart;

  const clearStatusSoon = useCallback((delayMs = 4000) => {
    window.setTimeout(() => {
      setVoiceStatus((current) => (current === 'hint' || current === 'error' ? 'idle' : current));
      setStatusMessage(null);
    }, delayMs);
  }, []);

  const resetSessionText = useCallback(() => {
    sessionCommittedRef.current = '';
    sessionInterimRef.current = '';
    setInterimText('');
  }, []);

  const finishHoldEnd = useCallback(
    (cancelled: boolean, recognition: SpeechRecognition | null) => {
      const queued = holdEndQueueRef.current;
      holdEndQueueRef.current = null;

      let text = '';
      if (!cancelled) {
        const flushed = readAllTranscript(recognition);
        text = flushed || [sessionCommittedRef.current, sessionInterimRef.current].filter(Boolean).join(' ').trim();
        if (text) {
          onTranscriptRef.current(text, { isFinal: true });
        }
      }

      resetSessionText();
      sessionActiveRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
      setIsPreparing(false);
      setVoiceStatus('idle');

      if (queued) {
        queued.resolve(cancelled ? '' : text);
      }
    },
    [resetSessionText],
  );

  const abortRecognition = useCallback(() => {
    const active = recognitionRef.current;
    sessionActiveRef.current = false;
    if (active) {
      try {
        active.abort();
      } catch {
        /* ignore */
      }
    }
    recognitionRef.current = null;
    resetSessionText();
    setIsListening(false);
    setIsPreparing(false);
    const queued = holdEndQueueRef.current;
    holdEndQueueRef.current = null;
    queued?.resolve('');
  }, [resetSessionText]);

  useEffect(() => {
    return () => {
      abortRecognition();
      const queued = holdEndQueueRef.current;
      holdEndQueueRef.current = null;
      queued?.resolve('');
    };
  }, [abortRecognition]);

  useEffect(() => {
    if (!isListening && !isPreparing) {
      setRecordingMs(0);
      return;
    }
    const started = Date.now();
    const tick = window.setInterval(() => {
      setRecordingMs(Date.now() - started);
    }, 200);
    return () => window.clearInterval(tick);
  }, [isListening, isPreparing]);

  useEffect(() => {
    if (!isPreparing || isListening) {
      return;
    }
    const timeout = window.setTimeout(() => {
      if (!recognitionRef.current) {
        abortRecognition();
        setVoiceStatus('error');
        setStatusMessage(t('chat.voiceError'));
        clearStatusSoon(6000);
      }
    }, 9000);
    return () => window.clearTimeout(timeout);
  }, [abortRecognition, clearStatusSoon, isListening, isPreparing, t]);

  const processHoldEndQueue = useCallback((recognition: SpeechRecognition) => {
    const queued = holdEndQueueRef.current;
    if (!queued) {
      return;
    }
    try {
      if (queued.cancel) {
        recognition.abort();
      } else {
        recognition.stop();
      }
    } catch {
      finishHoldEnd(queued.cancel, queued.cancel ? null : recognition);
    }
  }, [finishHoldEnd]);

  const beginRecognition = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setVoiceStatus('error');
      setStatusMessage(t('chat.voiceUnsupported'));
      clearStatusSoon(6000);
      sessionActiveRef.current = false;
      setIsPreparing(false);
      const queued = holdEndQueueRef.current;
      holdEndQueueRef.current = null;
      queued?.resolve('');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }

    resetSessionText();
    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    recognition.lang = resolveRecognitionLang(language);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsPreparing(false);
      setIsListening(true);
      setVoiceStatus('listening');
      setStatusMessage(null);
      processHoldEndQueue(recognition);
    };

    recognition.onend = () => {
      const active = recognitionRef.current === recognition ? recognition : null;
      const queued = holdEndQueueRef.current;
      if (queued) {
        finishHoldEnd(queued.cancel, queued.cancel ? null : active);
        return;
      }
      recognitionRef.current = null;
      sessionActiveRef.current = false;
      setIsListening(false);
      setIsPreparing(false);
      resetSessionText();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error;
      if (code === 'aborted') {
        return;
      }

      sessionActiveRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
      setIsPreparing(false);
      resetSessionText();

      const queued = holdEndQueueRef.current;
      holdEndQueueRef.current = null;
      queued?.resolve('');

      if (code === 'no-speech') {
        setVoiceStatus('hint');
        setStatusMessage(t('chat.voiceNoSpeech'));
        clearStatusSoon();
        return;
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setVoiceStatus('error');
        setStatusMessage(t('chat.voicePermissionDenied'));
        clearStatusSoon(8000);
        return;
      }
      setVoiceStatus('error');
      setStatusMessage(t('chat.voiceError'));
      clearStatusSoon(6000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const chunk = result?.[0]?.transcript ?? '';
        if (!chunk) {
          continue;
        }
        if (result.isFinal) {
          finalText += chunk;
        } else {
          interim += chunk;
        }
      }

      if (finalText.trim()) {
        sessionCommittedRef.current = sessionCommittedRef.current
          ? `${sessionCommittedRef.current} ${finalText.trim()}`
          : finalText.trim();
        sessionInterimRef.current = '';
      }
      if (interim.trim()) {
        sessionInterimRef.current = interim.trim();
      } else if (!finalText.trim()) {
        sessionInterimRef.current = '';
      }

      const live = [sessionCommittedRef.current, sessionInterimRef.current].filter(Boolean).join(' ').trim();
      setInterimText(sessionInterimRef.current);
      if (live) {
        onTranscriptRef.current(live, { isFinal: false });
      }
      if (finalText.trim()) {
        onTranscriptRef.current(sessionCommittedRef.current, { isFinal: true });
      }
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      sessionActiveRef.current = false;
      setIsListening(false);
      setIsPreparing(false);
      setVoiceStatus('error');
      setStatusMessage(t('chat.voiceError'));
      clearStatusSoon(6000);
      const queued = holdEndQueueRef.current;
      holdEndQueueRef.current = null;
      queued?.resolve('');
    }
  }, [clearStatusSoon, finishHoldEnd, language, processHoldEndQueue, resetSessionText, t]);

  const beginHoldRecording = useCallback(async () => {
    if (disabled) {
      return false;
    }
    if (sessionActiveRef.current || recognitionRef.current) {
      return true;
    }

    if (!window.isSecureContext) {
      setVoiceStatus('error');
      setStatusMessage(t('chat.voiceInsecure'));
      clearStatusSoon(8000);
      return false;
    }

    if (!getSpeechRecognitionCtor()) {
      setVoiceStatus('error');
      setStatusMessage(t('chat.voiceUnsupported'));
      clearStatusSoon(8000);
      return false;
    }

    setStatusMessage(t('chat.voicePreparing'));
    setIsPreparing(true);
    onListenStartRef.current?.();

    sessionActiveRef.current = true;
    beginRecognition();
    return true;
  }, [beginRecognition, clearStatusSoon, disabled, t]);

  const endHoldRecording = useCallback(
    (cancelled: boolean): Promise<string> => {
      return new Promise((resolve) => {
        const recognition = recognitionRef.current;

        if (!sessionActiveRef.current && !recognition && !isPreparing) {
          resolve('');
          return;
        }

        if (holdEndQueueRef.current) {
          holdEndQueueRef.current.resolve('');
        }

        holdEndQueueRef.current = { cancel: cancelled, resolve };

        if (recognition) {
          processHoldEndQueue(recognition);
          return;
        }

        if (cancelled) {
          abortRecognition();
          return;
        }

        const started = Date.now();
        const waitForRecognition = () => {
          const active = recognitionRef.current;
          if (active && holdEndQueueRef.current?.resolve === resolve) {
            processHoldEndQueue(active);
            return;
          }
          if (Date.now() - started > 2500) {
            finishHoldEnd(false, active ?? null);
            return;
          }
          window.requestAnimationFrame(waitForRecognition);
        };
        waitForRecognition();
      });
    },
    [abortRecognition, finishHoldEnd, isPreparing, processHoldEndQueue],
  );

  return {
    isListening,
    isPreparing,
    interimText,
    voiceStatus,
    statusMessage,
    recordingMs,
    beginHoldRecording,
    endHoldRecording,
  };
}

export function formatVoiceRecordingClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
