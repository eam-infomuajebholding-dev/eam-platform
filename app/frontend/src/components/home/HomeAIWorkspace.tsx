import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import HeroChat from '@/components/sections/Hero/HeroChat';
import AssistantWindowControls from '@/components/home/AssistantWindowControls';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ASSISTANT_RESTORE_EVENT,
  readAssistantMinimized,
} from '@/features/ai-workspace/assistantShell';

type HomeAIWorkspaceProps = {
  layout?: 'default' | 'dock';
};

/** EAM AI composer shell for homepage. */
export default function HomeAIWorkspace({ layout = 'default' }: HomeAIWorkspaceProps) {
  const { t } = useLanguage();
  const isDock = layout === 'dock';
  const [isMinimized, setIsMinimized] = useState(readAssistantMinimized);

  useEffect(() => {
    const onRestore = () => setIsMinimized(false);
    window.addEventListener(ASSISTANT_RESTORE_EVENT, onRestore);
    return () => window.removeEventListener(ASSISTANT_RESTORE_EVENT, onRestore);
  }, []);

  const headerControlsWidth = 'w-[4.5rem]';

  if (isMinimized && isDock) {
    return (
      <div role="region" className="home-ai-workspace w-full" aria-label={t('assistant.aria')}>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex w-full items-center gap-3 rounded-[20px] border border-[var(--eam-home-gold)]/55 bg-white px-4 py-3 text-start shadow-[0_10px_36px_rgba(139,77,0,0.28)] ring-1 ring-[var(--eam-home-gold)]/20 transition hover:border-[var(--eam-home-gold)] dark:bg-[var(--eam-home-cream-light)]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--eam-home-gold)]/15 text-[var(--eam-home-gold-deep)]">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[var(--eam-home-gold-deep)]">
              {t('assistant.header')}
            </span>
            <span className="block text-[11px] text-[var(--eam-home-ink)]/65">{t('assistant.compactHint')}</span>
          </span>
          <span className="shrink-0 rounded-full bg-[var(--eam-home-gold)] px-3 py-1 text-[11px] font-semibold text-white">
            {t('assistant.restore')}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      className={`home-ai-workspace w-full ${isDock ? 'max-w-[42rem]' : 'max-w-[min(100%,28rem)]'} ${
        isMinimized && isDock ? 'home-ai-workspace--minimized' : ''
      }`}
      aria-label={t('assistant.aria')}
    >
      <div
        className={`overflow-hidden border border-[var(--eam-home-gold)]/45 bg-white shadow-[0_12px_40px_rgba(139,77,0,0.22)] ring-1 ring-[var(--eam-home-gold)]/15 dark:border-[var(--eam-home-gold)]/55 dark:bg-[var(--eam-home-cream-light)] ${
          isDock ? 'rounded-[20px]' : 'rounded-[14px]'
        } ${!isMinimized || !isDock ? 'max-h-[min(72vh,640px)]' : ''}`}
      >
        <div className="flex min-h-[32px] items-center gap-2 border-b border-[var(--eam-home-border)]/70 bg-[var(--eam-home-cream-light)] px-3 py-1.5">
          {isDock ? (
            <div className={`flex shrink-0 justify-start ${headerControlsWidth}`}>
              <AssistantWindowControls
                minimized={isMinimized}
                onMinimize={() => setIsMinimized(true)}
                onRestore={() => setIsMinimized(false)}
              />
            </div>
          ) : null}
          <p
            className={`min-w-0 flex-1 truncate text-center text-[11px] font-medium leading-none text-[var(--eam-home-gold-deep)] ${
              isMinimized && isDock ? 'cursor-pointer hover:underline' : ''
            }`}
            onClick={isMinimized && isDock ? () => setIsMinimized(false) : undefined}
            onKeyDown={
              isMinimized && isDock
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setIsMinimized(false);
                    }
                  }
                : undefined
            }
            role={isMinimized && isDock ? 'button' : undefined}
            tabIndex={isMinimized && isDock ? 0 : undefined}
          >
            {t('assistant.header')}
          </p>
          {isDock ? <div className={`shrink-0 ${headerControlsWidth}`} aria-hidden /> : null}
        </div>

        {!isMinimized || !isDock ? (
          <HeroChat variant="homepage" shell={isDock ? 'dock' : 'embedded'} />
        ) : null}
      </div>
    </div>
  );
}
