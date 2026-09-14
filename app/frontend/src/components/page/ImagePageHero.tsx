import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MessageKey } from '@/i18n/messages';

type ImagePageHeroProps = {
  titleKey: MessageKey;
  subtitleKey?: MessageKey;
  backgroundImage?: string;
  ctaTo?: string;
  ctaKey?: MessageKey;
};

export default function ImagePageHero({
  titleKey,
  subtitleKey,
  backgroundImage,
  ctaTo,
  ctaKey,
}: ImagePageHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="eam-page-hero relative min-h-[300px] h-[40vh]">
      {backgroundImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream-light/90 via-cream-light/85 to-cream-light/95 dark:from-background/90 dark:via-background/85 dark:to-background/95" />
        </>
      ) : null}
      <div className="relative z-10 px-4 text-center">
        <h1 className="gold-text mb-4 font-display text-display-xl">{t(titleKey)}</h1>
        {subtitleKey ? (
          <p className="text-lead mx-auto max-w-2xl">{t(subtitleKey)}</p>
        ) : null}
        {ctaTo && ctaKey ? (
          <Link
            to={ctaTo}
            className="eam-btn-primary mt-6 inline-block"
          >
            {t(ctaKey)}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
