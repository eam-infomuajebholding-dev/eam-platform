import { useLanguage } from '@/contexts/LanguageContext';

const SERVICES_EMBLEM_SRC = '/assets/eam-emblem-services.png';
const UNIFIED_SECTOR_PLATFORMS_HREF = '/services/platforms';

/** Homepage-scale emblem — links to the unified sector platforms hub. */
export default function ServicesUnifiedPlatformEmblem() {
  const { t } = useLanguage();

  return (
    <a
      href={UNIFIED_SECTOR_PLATFORMS_HREF}
      className="services-unified-platform-emblem group mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-gold-400/35 bg-cream px-6 py-5 text-center shadow-[0_4px_24px_rgba(139,77,0,0.08)] transition hover:border-gold-500/55 hover:bg-cream-light hover:shadow-[0_8px_28px_rgba(139,77,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 dark:border-gold-500/40 dark:bg-surface"
      aria-label={t('page.services.unifiedPlatform.aria')}
    >
      <img
        src={SERVICES_EMBLEM_SRC}
        alt=""
        aria-hidden
        className="services-unified-platform-emblem__img pointer-events-none w-auto select-none"
        loading="lazy"
        decoding="async"
      />
      <span className="font-display text-sm font-semibold leading-snug text-gold-700 transition group-hover:text-gold-600 dark:text-gold-300 md:text-base">
        {t('page.services.unifiedPlatform.label')}
      </span>
    </a>
  );
}
