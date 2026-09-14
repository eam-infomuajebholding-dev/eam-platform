import type { MessageKey } from '@/i18n/messages';
import { useLanguage } from '@/contexts/LanguageContext';

type PageSectionHeaderProps = {
  titleKey?: MessageKey;
  title?: string;
  subtitleKey?: MessageKey;
  subtitle?: string;
  eyebrowKey?: MessageKey;
  center?: boolean;
  className?: string;
  titleEditableId?: string;
  subtitleEditableId?: string;
};

export default function PageSectionHeader({
  titleKey,
  title,
  subtitleKey,
  subtitle,
  eyebrowKey,
  center = true,
  className = '',
  titleEditableId,
  subtitleEditableId,
}: PageSectionHeaderProps) {
  const { t } = useLanguage();
  const resolvedTitle = titleKey ? t(titleKey) : title;
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle;

  return (
    <header className={`mb-10 md:mb-12 ${center ? 'text-center' : ''} ${className}`}>
      {eyebrowKey ? (
        <p className="text-label mb-3">{t(eyebrowKey)}</p>
      ) : null}
      {resolvedTitle ? (
        <h2
          data-editable-id={titleEditableId}
          className="font-display text-display-sm text-ink md:text-display-md"
        >
          {resolvedTitle}
        </h2>
      ) : null}
      {resolvedSubtitle ? (
        <p
          data-editable-id={subtitleEditableId}
          className="text-body mx-auto mt-3 max-w-2xl"
        >
          {resolvedSubtitle}
        </p>
      ) : null}
    </header>
  );
}
