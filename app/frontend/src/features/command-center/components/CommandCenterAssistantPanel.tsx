import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { fetchExecutiveBrief } from '@/features/command-center/api/commandCenterClient';
import { useLanguage } from '@/contexts/LanguageContext';

const PROMPT_KEYS = [
  'commandCenter.assistant.prompt.performance',
  'commandCenter.assistant.prompt.risks',
  'commandCenter.assistant.prompt.backlog',
  'commandCenter.assistant.prompt.decisions',
] as const;

export default function CommandCenterAssistantPanel() {
  const { t } = useLanguage();
  const [answer, setAnswer] = useState<string | null>(null);

  const briefMutation = useMutation({
    mutationFn: (question: string) => fetchExecutiveBrief(question),
    onSuccess: (brief) => {
      const lines = [
        ...brief.facts.slice(0, 2),
        ...brief.recommendations.slice(0, 2),
        ...brief.decisions_needed.slice(0, 1),
      ].filter(Boolean);
      setAnswer(lines.join('\n'));
    },
  });

  return (
    <section className="rounded-2xl border border-gold/20 bg-gradient-to-br from-[#1a2634] to-[#243447] p-4 text-white shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20 text-gold-200">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold">{t('commandCenter.assistant.title')}</h3>
          <p className="text-xs text-white/65">{t('commandCenter.assistant.subtitle')}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {PROMPT_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={briefMutation.isPending}
            onClick={() => {
              setAnswer(null);
              void briefMutation.mutateAsync(t(key));
            }}
            className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-white/90 transition hover:bg-white/12"
          >
            {t(key)}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const input = form.elements.namedItem('assistant-question') as HTMLInputElement;
          const question = input.value.trim();
          if (!question) return;
          setAnswer(null);
          void briefMutation.mutateAsync(question);
          input.value = '';
        }}
      >
        <input
          name="assistant-question"
          type="text"
          placeholder={t('commandCenter.assistant.placeholder')}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45"
        />
        <button
          type="submit"
          disabled={briefMutation.isPending}
          className="inline-flex items-center gap-1 rounded-xl bg-gold px-3 py-2 text-xs font-bold text-white"
        >
          {briefMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {t('commandCenter.assistant.ask')}
        </button>
      </form>

      {briefMutation.isError ? (
        <p className="mt-3 text-xs text-red-200">{t('commandCenter.assistant.error')}</p>
      ) : null}

      {answer ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-6 text-white/85 whitespace-pre-line">
          {answer}
        </div>
      ) : null}
    </section>
  );
}
