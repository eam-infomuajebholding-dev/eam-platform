import { useState, useRef, useEffect, KeyboardEvent, useCallback } from "react";
import { useAssistantVoiceInput, type VoiceTranscriptMeta } from "@/hooks/useAssistantVoiceInput";
import AssistantHoldToTalkMic from "@/components/assistant/AssistantHoldToTalkMic";
import AssistantVoiceRecordingBar from "@/components/assistant/AssistantVoiceRecordingBar";
import { Link } from "react-router-dom";
import { ArrowUp, ExternalLink, Loader2, Map, Paperclip, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWorkspace } from "@/features/ai-workspace/WorkspaceContext";

type HeroChatProps = {
  variant?: "default" | "homepage";
  /** Strip outer card chrome when parent provides the shell (homepage composer). */
  shell?: "default" | "embedded" | "dock";
  /** Site editor: natural-language edits applied on send. */
  siteEditMode?: boolean;
};

export default function HeroChat({
  variant = "default",
  shell = "default",
  siteEditMode = false,
}: HeroChatProps) {
  const { messages, streamingContent, isBusy, workspaceError, sendMessage, acceptPendingJourney } = useWorkspace();
  const { t, direction, language } = useLanguage();

  const [input, setInput] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceCommittedRef = useRef("");
  const voiceInterimRef = useRef("");
  const voiceStartSnapshotRef = useRef("");
  const holdOriginXRef = useRef(0);
  const holdPointerDownRef = useRef(false);
  const [cancelArmed, setCancelArmed] = useState(false);
  const [micHeld, setMicHeld] = useState(false);
  const isHomepage = variant === "homepage";
  const isDockShell = isHomepage && shell === "dock";

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) {
      return;
    }

    let message = trimmed;
    if (attachedFileName) {
      message = `${trimmed}\n[${t("chat.attachmentAdded")}: ${attachedFileName}]`;
      setAttachedFileName(null);
    }

    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
    event.target.value = "";
  };

  const composeVoiceDraft = useCallback((committed: string, interim: string) => {
    const parts = [committed.trim(), interim.trim()].filter(Boolean);
    return parts.join(" ");
  }, []);

  const primeVoiceSession = useCallback(() => {
    voiceStartSnapshotRef.current = input;
    voiceCommittedRef.current = input.trim();
    voiceInterimRef.current = "";
  }, [input]);

  const handleVoiceListenStart = useCallback(() => {
    primeVoiceSession();
  }, [primeVoiceSession]);

  const handleVoiceTranscript = useCallback(
    (transcript: string, meta: VoiceTranscriptMeta) => {
      const chunk = transcript.trim();
      if (!chunk) {
        return;
      }

      if (!meta.isFinal) {
        voiceInterimRef.current = chunk;
        setInput(composeVoiceDraft(voiceCommittedRef.current, voiceInterimRef.current));
        return;
      }

      voiceCommittedRef.current = voiceCommittedRef.current
        ? `${voiceCommittedRef.current} ${chunk}`
        : chunk;
      voiceInterimRef.current = "";
      setInput(composeVoiceDraft(voiceCommittedRef.current, ""));
    },
    [composeVoiceDraft],
  );

  const {
    isListening,
    isPreparing,
    interimText,
    statusMessage,
    recordingMs,
    beginHoldRecording,
    endHoldRecording,
  } = useAssistantVoiceInput({
      language,
      disabled: isBusy,
      onListenStart: handleVoiceListenStart,
      onTranscript: handleVoiceTranscript,
      t,
    });

  const updateSlideCancel = useCallback(
    (clientX: number) => {
      const dx = clientX - holdOriginXRef.current;
      const armed = direction === "rtl" ? dx > 72 : dx < -72;
      setCancelArmed(armed);
    },
    [direction],
  );

  const commitHoldTranscript = useCallback(
    (cancelled: boolean) => {
      if (cancelled) {
        setInput(voiceStartSnapshotRef.current);
        voiceCommittedRef.current = "";
        voiceInterimRef.current = "";
        setCancelArmed(false);
        return;
      }

      const message = composeVoiceDraft(voiceCommittedRef.current, voiceInterimRef.current).trim();
      voiceCommittedRef.current = "";
      voiceInterimRef.current = "";
      setCancelArmed(false);

      if (!message) {
        setInput(voiceStartSnapshotRef.current);
        return;
      }

      setInput(message);
      if (isDockShell) {
        void sendMessage(message);
        setInput("");
      }
    },
    [composeVoiceDraft, isDockShell, sendMessage],
  );

  const finalizeHold = useCallback(
    async (cancelled: boolean) => {
      try {
        if (cancelled) {
          await endHoldRecording(true);
          commitHoldTranscript(true);
          return;
        }

        const transcript = (await endHoldRecording(false)).trim();
        if (transcript) {
          voiceCommittedRef.current = transcript;
          voiceInterimRef.current = "";
          commitHoldTranscript(false);
          return;
        }

        commitHoldTranscript(false);
      } finally {
        holdPointerDownRef.current = false;
        setMicHeld(false);
        setCancelArmed(false);
      }
    },
    [commitHoldTranscript, endHoldRecording],
  );

  const handleMicHoldStart = useCallback(
    async (clientX: number) => {
      holdOriginXRef.current = clientX;
      holdPointerDownRef.current = true;
      setMicHeld(true);
      setCancelArmed(false);
      handleVoiceListenStart();
      const started = await beginHoldRecording();
      if (!holdPointerDownRef.current) {
        await endHoldRecording(true);
        return;
      }
      if (!started) {
        holdPointerDownRef.current = false;
        setMicHeld(false);
      }
    },
    [beginHoldRecording, endHoldRecording, handleVoiceListenStart],
  );

  const showVoiceRecordingUi = isListening || isPreparing || micHeld;

  const renderHoldMic = (className: string, iconClassName: string) => (
    <AssistantHoldToTalkMic
      disabled={isBusy}
      isListening={showVoiceRecordingUi}
      cancelArmed={cancelArmed}
      className={className}
      iconClassName={iconClassName}
      ariaLabel={t("chat.voice")}
      onHoldStart={handleMicHoldStart}
      onHoldMove={updateSlideCancel}
      onHoldEnd={(cancel) => void finalizeHold(cancel)}
    />
  );

  const isDock = isDockShell;
  const isEmbedded = isHomepage && (shell === "embedded" || shell === "dock");

  const cardClass = isDock
    ? "home-hero-chat home-hero-chat-dock w-full overflow-hidden bg-white dark:bg-[var(--eam-home-cream-light)]"
    : isEmbedded
      ? "home-hero-chat w-full overflow-hidden bg-white dark:bg-[var(--eam-home-cream-light)]"
      : isHomepage
        ? "home-hero-chat mx-auto w-full overflow-hidden rounded-[18px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/92 shadow-[0_2px_14px_rgba(139,77,0,0.08)] dark:border-white/10 dark:bg-dark"
        : "mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border border-soft-border bg-cream shadow-md dark:border-white/10 dark:bg-dark";

  const homepageCompact = isHomepage && messages.length === 0 && !streamingContent;
  const composerPlaceholder = siteEditMode
    ? t("chat.placeholder.siteEdit")
    : isHomepage
      ? t("chat.placeholder.free")
      : t("chat.placeholder.general");

  const voiceAwarePlaceholder = statusMessage
    ? statusMessage
    : isListening && interimText
      ? interimText
      : isListening
        ? t("chat.voiceListening")
        : composerPlaceholder;

  return (
    <div className={isHomepage ? "home-hero-chat-wrap" : "-mt-0"}>
      {isHomepage && !isEmbedded ? (
        <p className="mb-1 text-center text-[13px] font-semibold text-[var(--eam-home-gold-deep)]">
          {t("chat.brand")}
        </p>
      ) : !isHomepage ? (
        <div className="mb-1 text-center">
          <p className="mx-auto max-w-3xl text-base leading-7 text-ink/70 dark:text-white/80">
            {t("chat.defaultDescription")}
          </p>
        </div>
      ) : null}

      <div className={cardClass}>
        {(messages.length > 0 || streamingContent) && (
          <div
            ref={messagesRef}
            className={`overflow-y-auto space-y-3 border-b border-soft-border/40 dark:border-white/10 ${
              isHomepage ? "max-h-[min(38vh,280px)] px-4 py-3" : "max-h-[320px] px-7 py-5"
            }`}
            dir={direction}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ms-8 bg-surface-alt text-ink dark:bg-white/10 dark:text-white"
                    : "me-8 bg-gold/10 text-ink/90"
                }`}
              >
                {message.content}

                {message.role === 'assistant' && message.journeyOffer ? (
                  <button
                    type="button"
                    className="mt-2 rounded-full bg-[var(--eam-home-gold)] px-3 py-1 text-[11px] font-semibold text-white"
                    onClick={() => void acceptPendingJourney(message.journeyOffer!)}
                  >
                    ابدأ رحلة {message.journeyOffer.label}
                  </button>
                ) : null}

                {message.role === 'assistant' && message.citations && message.citations.length > 0 ? (
                  <p className="mt-2 text-[11px] text-ink/60">مصادر: {message.citations.join('، ')}</p>
                ) : null}

                {message.role === "assistant" && message.resourceLinks && message.resourceLinks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.resourceLinks.map((link) => (
                      <Link
                        key={`${message.id}-${link.href}`}
                        to={link.href}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--eam-home-border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)] dark:border-white/15 dark:bg-transparent dark:text-gold"
                      >
                        <Map className="h-3 w-3" />
                        {link.label}
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {streamingContent ? (
              <div className="me-8 rounded-2xl bg-gold/10 px-4 py-3 text-sm leading-relaxed dark:text-white/90">
                {streamingContent}
                <span className="inline-block h-4 w-1 animate-pulse bg-gold/70 align-middle" />
              </div>
            ) : null}
          </div>
        )}

        {workspaceError ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200 md:px-7 md:py-3">
            {workspaceError}
          </div>
        ) : null}

        {attachedFileName && isDock ? (
          <div className="flex items-center justify-between gap-2 border-b border-[var(--eam-home-border)]/60 bg-[var(--eam-home-cream-light)]/80 px-3 py-1.5 text-[11px] text-[var(--eam-home-ink)]/75">
            <span className="truncate">
              {t("chat.attachmentAdded")}: {attachedFileName}
            </span>
            <button
              type="button"
              onClick={() => setAttachedFileName(null)}
              className="shrink-0 text-[var(--eam-home-gold-deep)]"
              aria-label={t("chat.attach")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {isDock ? (
          <div className="home-assistant-composer border-t border-[var(--eam-home-border)]/70 bg-white px-2.5 py-2 dark:bg-[var(--eam-home-cream-light)]">
            <div className="flex min-h-[48px] items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                aria-hidden
                tabIndex={-1}
              />
              {!showVoiceRecordingUi ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--eam-home-ink)]/55 transition hover:bg-[var(--eam-home-cream-light)] hover:text-[var(--eam-home-gold-deep)] disabled:opacity-50"
                  aria-label={t("chat.attach")}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              ) : null}
              {showVoiceRecordingUi ? (
                <AssistantVoiceRecordingBar
                  recordingMs={recordingMs}
                  cancelArmed={cancelArmed}
                  previewText={input.trim() || undefined}
                />
              ) : (
                <textarea
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isBusy}
                  placeholder={voiceAwarePlaceholder}
                  className="min-h-[36px] max-h-[72px] flex-1 resize-none rounded-xl border border-[var(--eam-home-border)] bg-white px-3 py-2 text-[13px] leading-5 text-ink outline-none placeholder:text-ink/55 focus:border-[var(--eam-home-gold)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/55"
                  dir={direction}
                />
              )}
              {renderHoldMic(
                `flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                  showVoiceRecordingUi
                    ? "bg-red-500/10 text-red-600"
                    : "text-[var(--eam-home-ink)]/55 hover:bg-[var(--eam-home-cream-light)] hover:text-[var(--eam-home-gold-deep)]"
                }`,
                "h-4 w-4",
              )}
              {!showVoiceRecordingUi ? (
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={isBusy || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2B2118] text-white transition hover:bg-[#1a1a2e] disabled:opacity-50"
                  aria-label={t("chat.send")}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </button>
              ) : null}
            </div>
            {statusMessage ? (
              <p className="mt-1 px-1 text-[10px] leading-snug text-[var(--eam-home-gold-deep)]" role="status">
                {statusMessage}
              </p>
            ) : null}
          </div>
        ) : homepageCompact ? (
          <div
            className={`flex min-h-[40px] items-center gap-1 px-2 py-1.5 ${
              isEmbedded ? "bg-white dark:bg-[var(--eam-home-cream-light)]" : ""
            }`}
          >
            {showVoiceRecordingUi ? (
              <AssistantVoiceRecordingBar
                recordingMs={recordingMs}
                cancelArmed={cancelArmed}
                previewText={input.trim() || undefined}
                compact
              />
            ) : (
              <textarea
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
                placeholder={voiceAwarePlaceholder}
                className={`min-h-[32px] max-h-[32px] flex-1 resize-none border-0 px-2 py-1.5 text-[12px] leading-5 text-ink outline-none placeholder:text-ink/55 dark:text-white dark:placeholder:text-white/55 ${
                  isEmbedded ? "bg-white dark:bg-[var(--eam-home-cream-light)]" : "bg-transparent"
                }`}
                dir={direction}
              />
            )}
            {renderHoldMic(
              `flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                showVoiceRecordingUi ? "text-red-600" : "text-ink/50 hover:bg-surface-alt dark:hover:bg-white/10"
              }`,
              "h-3.5 w-3.5",
            )}
            {!showVoiceRecordingUi ? (
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={isBusy || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-50"
                aria-label={t("chat.send")}
              >
                {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
              </button>
            ) : null}
          </div>
        ) : (
          <div className={`flex items-end gap-2 ${isHomepage ? "px-3 py-2" : "px-5 py-4 md:px-7"}`}>
            {!isHomepage ? (
              <>
                <button
                  type="button"
                  className="rounded-full p-2 text-ink/50 hover:bg-surface-alt dark:hover:bg-white/10"
                  aria-label={t("chat.attach")}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                {renderHoldMic(
                  "rounded-full p-2 text-ink/50 hover:bg-surface-alt disabled:opacity-50 dark:hover:bg-white/10",
                  "h-5 w-5",
                )}
              </>
            ) : (
              renderHoldMic(
                `rounded-full p-2 disabled:opacity-50 ${
                  showVoiceRecordingUi ? "text-red-600" : "text-ink/50 hover:bg-surface-alt dark:hover:bg-white/10"
                }`,
                "h-5 w-5",
              )
            )}
            {showVoiceRecordingUi ? (
              <AssistantVoiceRecordingBar
                recordingMs={recordingMs}
                cancelArmed={cancelArmed}
                previewText={input.trim() || undefined}
              />
            ) : (
              <textarea
                rows={isHomepage ? 1 : 2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
                placeholder={voiceAwarePlaceholder}
                className="flex-1 resize-none rounded-2xl border border-soft-border/80 bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white"
                dir={direction}
              />
            )}
            {!showVoiceRecordingUi ? (
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={isBusy || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-50"
                aria-label={t("chat.send")}
              >
                {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
