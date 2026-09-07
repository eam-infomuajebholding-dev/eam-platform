import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Loader2, Mic, Paperclip } from "lucide-react";
import { useWorkspace } from "@/ai/WorkspaceContext";
import BuildVillaStepPanel from "@/jos/journeys/buildVilla/BuildVillaStepPanel";
import type { BuildVillaContext } from "@/jos/journeys/buildVilla/types";

export default function HeroChat() {
  const {
    mode,
    messages,
    streamingContent,
    isBusy,
    workspaceError,
    completionNotice,
    currentInstance,
    stepValues,
    setStepValues,
    fieldErrors,
    formError,
    sendMessage,
    advanceCurrentStep,
    completeCurrentJourney,
  } = useWorkspace();

  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  const context = (currentInstance?.context ?? {}) as BuildVillaContext;
  const currentStep = currentInstance?.current_step_key ?? null;
  const isCompleted = currentInstance?.status === "completed";
  const isTerminal = currentStep === "intake_complete";
  const isJourneyMode =
    mode === "journey" &&
    currentInstance != null &&
    currentInstance.status !== "completed";

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingContent, mode, currentStep]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy || isJourneyMode) {
      return;
    }
    setInput("");
    await sendMessage(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="-mt-0">
      <div className="mb-1 text-center">
        <p className="mx-auto max-w-3xl text-lg leading-8 text-gray-600 dark:text-white/80">
          مساعد هندسي ذكي يساعدك في اختيار الخدمة المناسبة،
          وتقدير المتطلبات، وبدء رحلتك مع فريق إعمار.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-dark">
        {(messages.length > 0 || streamingContent || isJourneyMode) && (
          <div
            ref={messagesRef}
            className="max-h-[320px] overflow-y-auto px-7 py-5 space-y-3 border-b border-gray-100 dark:border-white/10"
            dir="rtl"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm font-tajawal leading-relaxed ${
                  message.role === "user"
                    ? "ms-8 bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                    : "me-8 bg-gold/10 text-gray-800 dark:text-white/90"
                }`}
              >
                {message.content}
              </div>
            ))}

            {streamingContent ? (
              <div className="me-8 rounded-2xl bg-gold/10 px-4 py-3 text-sm font-tajawal leading-relaxed dark:text-white/90">
                {streamingContent}
                <span className="inline-block h-4 w-1 animate-pulse bg-gold/70 align-middle" />
              </div>
            ) : null}

            {isJourneyMode && !isCompleted ? (
              <BuildVillaStepPanel
                currentStep={currentStep}
                context={context}
                values={stepValues}
                onChange={setStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
                compact
              />
            ) : null}

            {isCompleted ? (
              <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-tajawal text-green-800 dark:bg-green-950/20 dark:text-green-200">
                تم إكمال رحلة جمع المعلومات بنجاح.
              </div>
            ) : null}
          </div>
        )}

        {workspaceError && !isJourneyMode ? (
          <div className="border-b border-red-200 bg-red-50 px-7 py-3 text-sm font-tajawal text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {workspaceError}
          </div>
        ) : null}

        <textarea
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy || isJourneyMode}
          placeholder={
            isJourneyMode
              ? "أكمل الخطوات أعلاه لإنهاء رحلة جمع المعلومات..."
              : "صف مشروعك أو اطرح سؤالك..."
          }
          className="
            w-full
            box-border
            min-h-[64px]
            max-h-[220px]
            resize-none
            overflow-y-auto
            border-none
            bg-transparent
            px-7
            py-5
            text-[17px]
            leading-6
            text-gray-900
            outline-none
            placeholder:text-gray-400
            disabled:opacity-60
            dark:text-white
            dark:placeholder:text-white/40
          "
        />

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="إرفاق ملف"
              disabled
              className="rounded-xl p-2.5 opacity-40"
            >
              <Paperclip size={20} />
            </button>

            <button
              type="button"
              aria-label="إدخال صوتي"
              disabled
              className="rounded-xl p-2.5 opacity-40"
            >
              <Mic size={20} />
            </button>
          </div>

          <button
            type="button"
            aria-label="إرسال"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isBusy || isJourneyMode}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#6B7280]
              text-white
              transition-all
              duration-200
              hover:bg-gray-800
              hover:scale-105
              disabled:opacity-40
              disabled:hover:scale-100
            "
          >
            {isBusy && !isJourneyMode ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowUp size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
