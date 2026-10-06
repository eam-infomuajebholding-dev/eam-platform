import { useLanguage } from '@/contexts/LanguageContext';
import type { MessageKey } from '@/i18n/messages';

type PageHeroProps = {
  titleKey: MessageKey;
  subtitleKey?: MessageKey;
  titleEditableId?: string;
  subtitleEditableId?: string;
};

function messageKeyToEditableId(key: MessageKey): string {
  return key.replace(/\./g, '-');
}

export default function PageHero({
  titleKey,
  subtitleKey,
  titleEditableId,
  subtitleEditableId,
}: PageHeroProps) {
  const { t } = useLanguage();
  const resolvedTitleId = titleEditableId ?? messageKeyToEditableId(titleKey);
  const resolvedSubtitleId = subtitleKey
    ? (subtitleEditableId ?? messageKeyToEditableId(subtitleKey))
    : undefined;

  return (
    <section className="eam-page-hero" data-page-section="hero" data-section-label="البطل">
      <div className="relative z-10 px-4 text-center">
        <h1
          data-editable-id={resolvedTitleId}
          className="gold-text mb-4 font-display text-display-xl"
        >
          {t(titleKey)}
        </h1>
        {subtitleKey ? (
          <p
            data-editable-id={resolvedSubtitleId}
            className="text-lead mx-auto max-w-2xl dark:text-ink-secondary"
          >
            {t(subtitleKey)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
