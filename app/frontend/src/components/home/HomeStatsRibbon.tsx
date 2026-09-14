import { useLanguage } from '@/contexts/LanguageContext';

/** Qualitative trust pillars — no unverified numeric claims (WO-021 B13) */
export default function HomeStatsRibbon() {
  const { t } = useLanguage();

  const trustPillars = [
    { label: t('stats.excellence.label'), detail: t('stats.excellence.detail') },
    { label: t('stats.trust.label'), detail: t('stats.trust.detail') },
    { label: t('stats.sustainability.label'), detail: t('stats.sustainability.detail') },
    { label: t('stats.innovation.label'), detail: t('stats.innovation.detail') },
  ];

  return (
    <section
      className="home-stats-ribbon home-post-rails-block overflow-hidden rounded-[14px] border border-[var(--eam-home-border)] bg-[#2B2118] px-3 py-2.5 text-white sm:px-4"
      aria-label={t('stats.aria')}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs font-medium text-[var(--eam-home-gold-soft)] sm:text-right">
          {t('stats.tagline')}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-5">
          {trustPillars.map((pillar) => (
            <div key={pillar.label} className="text-center sm:text-right">
              <p className="text-xs font-bold text-[var(--eam-home-gold-soft)]">{pillar.label}</p>
              <p className="mt-0.5 text-[10px] text-white/65">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
