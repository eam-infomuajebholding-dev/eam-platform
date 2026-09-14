import { useLanguage } from '@/contexts/LanguageContext';
import type { MessageKey } from '@/i18n/messages';

type PageHeroProps = {
  titleKey: MessageKey;
  subtitleKey?: MessageKey;
  titleEditableId?: string;
  subtitleEditableId?: string;
};

export default function PageHero({
  titleKey,
  subtitleKey,
  titleEditableId,
  subtitleEditableId,
}: PageHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="eam-page-hero">
      <div className="relative z-10 px-4 text-center">
        <h1
          data-editable-id={titleEditableId}
          className="gold-text mb-4 font-display text-display-xl"
        >
          {t(titleKey)}
        </h1>
        {subtitleKey ? (
          <p
            data-editable-id={subtitleEditableId}
            className="text-lead mx-auto max-w-2xl dark:text-ink-secondary"
          >
            {t(subtitleKey)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
