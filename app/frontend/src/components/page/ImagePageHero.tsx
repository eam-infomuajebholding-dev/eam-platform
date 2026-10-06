import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MessageKey } from '@/i18n/messages';

type ImagePageHeroProps = {
  titleKey: MessageKey;
  subtitleKey?: MessageKey;
  backgroundImage?: string;
  ctaTo?: string;
  ctaKey?: MessageKey;
  titleEditableId?: string;
  subtitleEditableId?: string;
  backgroundEditableId?: string;
};

function messageKeyToEditableId(key: MessageKey): string {
  return key.replace(/\./g, '-');
}

export default function ImagePageHero({
  titleKey,
  subtitleKey,
  backgroundImage,
  ctaTo,
  ctaKey,
  titleEditableId,
  subtitleEditableId,
  backgroundEditableId,
}: ImagePageHeroProps) {
  const { t } = useLanguage();
  const resolvedTitleId = titleEditableId ?? messageKeyToEditableId(titleKey);
  const resolvedSubtitleId = subtitleKey
    ? (subtitleEditableId ?? messageKeyToEditableId(subtitleKey))
    : undefined;
  const resolvedBgId =
    backgroundEditableId ??
    (backgroundImage ? `${messageKeyToEditableId(titleKey)}-bg` : undefined);

  return (
    <section
      className="eam-page-hero relative min-h-[300px] h-[40vh]"
      data-page-section="hero"
      data-section-label="البطل"
    >
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            data-editable-id={resolvedBgId}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream-light/90 via-cream-light/85 to-cream-light/95 dark:from-background/90 dark:via-background/85 dark:to-background/95"
            aria-hidden
          />
        </>
      ) : null}
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
            className="text-lead mx-auto max-w-2xl"
          >
            {t(subtitleKey)}
          </p>
        ) : null}
        {ctaTo && ctaKey ? (
          <Link to={ctaTo} className="eam-btn-primary mt-6 inline-block">
            {t(ctaKey)}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
