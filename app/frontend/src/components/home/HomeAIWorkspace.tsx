import { useEffect, useLayoutEffect, useState } from 'react';
import HeroChat from '@/components/sections/Hero/HeroChat';
import AssistantWindowControls from '@/components/home/AssistantWindowControls';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ASSISTANT_LAYOUT_EVENT,
  ASSISTANT_RESTORE_EVENT,
  readAssistantMinimized,
} from '@/features/ai-workspace/assistantShell';

type HomeAIWorkspaceProps = {
  layout?: 'default' | 'dock';
  siteEditMode?: boolean;
};

/** EAM AI composer shell for homepage. */
export default function HomeAIWorkspace({ layout = 'default', siteEditMode = false }: HomeAIWorkspaceProps) {
  const { t } = useLanguage();
  const isDock = layout === 'dock';
  const [isMinimized, setIsMinimized] = useState(readAssistantMinimized);

  useEffect(() => {
    const onRestore = () => setIsMinimized(false);
    window.addEventListener(ASSISTANT_RESTORE_EVENT, onRestore);
    return () => window.removeEventListener(ASSISTANT_RESTORE_EVENT, onRestore);
  }, []);

  useLayoutEffect(() => {
    if (!isDock) {
      return;
    }
    window.dispatchEvent(new CustomEvent(ASSISTANT_LAYOUT_EVENT));
  }, [isDock, isMinimized]);

  const headerControlsWidth = 'w-[4.5rem]';

  const dockPanelMaxClass =
    isMinimized && isDock
      ? 'h-auto max-h-none home-ai-workspace-panel--minimized'
      : 'max-h-[min(72vh,640px)] home-ai-workspace-panel--expanded';

  return (
    <div
      role="region"
      className={`home-ai-workspace ${
        isDock
          ? isMinimized
            ? 'w-fit max-w-[min(100%,42rem)]'
            : 'w-full max-w-[42rem]'
          : 'w-full max-w-[min(100%,28rem)]'
      } ${isMinimized && isDock ? 'home-ai-workspace--minimized' : ''}`}
      aria-label={t('assistant.aria')}
    >
      <div
        className={`home-ai-workspace-panel overflow-hidden border border-[var(--eam-home-gold)]/45 bg-white shadow-[0_12px_40px_rgba(139,77,0,0.22)] ring-1 ring-[var(--eam-home-gold)]/15 dark:border-[var(--eam-home-gold)]/55 dark:bg-[var(--eam-home-cream-light)] ${
          isDock ? 'rounded-[20px]' : 'rounded-[14px]'
        } ${isDock ? dockPanelMaxClass : 'max-h-[min(72vh,640px)]'}`}
      >
        <div
          className={`flex min-h-[32px] items-center gap-2 bg-[var(--eam-home-cream-light)] px-3 py-1.5 ${
            isMinimized && isDock
              ? ''
              : 'border-b border-[var(--eam-home-border)]/70'
          }`}
        >
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
            {siteEditMode ? t('assistant.header.siteEdit') : t('assistant.header')}
          </p>
          {isDock ? <div className={`shrink-0 ${headerControlsWidth}`} aria-hidden /> : null}
        </div>

        {!isMinimized || !isDock ? (
          <HeroChat variant="homepage" shell={isDock ? 'dock' : 'embedded'} siteEditMode={siteEditMode} />
        ) : null}
      </div>
    </div>
  );
}
