import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MessageKey } from '@/i18n/messages';

type PageCtaSectionProps = {
  titleKey: MessageKey;
  descKey?: MessageKey;
  buttonKey: MessageKey;
  buttonTo: string;
};

export default function PageCtaSection({
  titleKey,
  descKey,
  buttonKey,
  buttonTo,
}: PageCtaSectionProps) {
  const { t } = useLanguage();

  return (
    <section
      className="relative overflow-hidden border-t border-soft-border/60 bg-cream py-16 dark:bg-surface md:py-20"
      data-page-section="cta"
      data-section-label="دعوة للإجراء"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold-400)_12%,transparent)_0%,transparent_65%)]"
        aria-hidden
      />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2
          data-editable-id={titleKey.replace(/\./g, '-')}
          className="gold-text mb-6 font-display text-display-md"
        >
          {t(titleKey)}
        </h2>
        {descKey ? (
          <p
            data-editable-id={descKey.replace(/\./g, '-')}
            className="text-lead mx-auto mb-8 max-w-xl"
          >
            {t(descKey)}
          </p>
        ) : null}
        <Link
          to={buttonTo}
          className="inline-block rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-4 text-lg font-bold text-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg"
        >
          {t(buttonKey)}
        </Link>
      </div>
    </section>
  );
}
