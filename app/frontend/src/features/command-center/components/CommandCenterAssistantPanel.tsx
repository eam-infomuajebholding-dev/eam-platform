import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bot, Loader2, Send } from 'lucide-react';
import { fetchExecutiveBrief } from '@/features/command-center/api/commandCenterClient';
import { useLanguage } from '@/contexts/LanguageContext';

const PROMPT_KEYS = [
  'commandCenter.assistant.prompt.performance',
  'commandCenter.assistant.prompt.opportunity',
  'commandCenter.assistant.prompt.report',
] as const;

export default function CommandCenterAssistantPanel() {
  const { t, language } = useLanguage();
  const briefLocale = language.toLowerCase().startsWith('en') ? 'en' : 'ar';
  const [answer, setAnswer] = useState<string | null>(null);

  const briefMutation = useMutation({
    mutationFn: (question: string) =>
      fetchExecutiveBrief(question, { locale: briefLocale, route: '/command-center' }),
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
    <section className="command-center-assistant">
      <div className="command-center-assistant__head">
        <div className="command-center-assistant__avatar">
          <Bot size={18} aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-bold">{t('commandCenter.assistant.title')}</h3>
          <p className="text-xs text-white/70">{t('commandCenter.assistant.intro')}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {PROMPT_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={briefMutation.isPending}
            onClick={() => {
              setAnswer(null);
              void briefMutation.mutateAsync(t(key));
            }}
            className="command-center-assistant__chip"
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
          className="command-center-assistant__input min-w-0 flex-1"
        />
        <button
          type="submit"
          disabled={briefMutation.isPending}
          className="command-center-assistant__send"
          aria-label={t('commandCenter.assistant.ask')}
        >
          {briefMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {briefMutation.isError ? (
        <p className="mt-3 text-xs text-red-200">{t('commandCenter.assistant.error')}</p>
      ) : null}

      {answer ? (
        <div className="command-center-assistant__answer whitespace-pre-line">{answer}</div>
      ) : null}
    </section>
  );
}
