import { Link } from 'react-router-dom';
import { COMMAND_CENTER_PLATFORM_MODULES } from '@/features/command-center/data/commandCenterPlatformModules';
import { getSectorBySlug } from '@/data/sectors';
import { isCommandCenterOpenAccessEnabled } from '@/config/commandCenterDevAccess';
import type { JourneyMetricRow } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  journeyMetrics: JourneyMetricRow[];
};

function resolveLiveCount(countSlug: string | undefined, journeyMetrics: JourneyMetricRow[]): number {
  if (!countSlug) return 0;
  const sector = getSectorBySlug(countSlug);
  const titleAr = sector?.title;
  const byLabel = titleAr
    ? journeyMetrics.find((row) => row.label_ar === titleAr)
    : undefined;
  const byType = journeyMetrics.find((row) => row.journey_type === countSlug);
  const row = byLabel ?? byType;
  if (!row) return 0;
  return row.service_request_count + row.active_count;
}

function displayCount(
  live: number,
  showcaseCount: number | undefined,
): number | null {
  if (live > 0) return live;
  if (isCommandCenterOpenAccessEnabled && showcaseCount != null) return showcaseCount;
  return live > 0 ? live : null;
}

export default function CommandCenterSectorGrid({ journeyMetrics }: Props) {
  const { t, language } = useLanguage();

  return (
    <section
      id="platform-sections"
      className="command-center-module-grid scroll-mt-24 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-surface"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">{t('commandCenter.sectors.title')}</h3>
          <p className="text-sm text-ink-secondary">{t('commandCenter.sectors.subtitle')}</p>
        </div>
        <span className="rounded-full bg-gold/12 px-3 py-1 text-xs font-bold text-gold-700">
          {COMMAND_CENTER_PLATFORM_MODULES.length}
        </span>
      </div>

      <div className="command-center-module-grid__tiles grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {COMMAND_CENTER_PLATFORM_MODULES.map((module) => {
          const Icon = module.icon;
          const live = resolveLiveCount(module.countSlug, journeyMetrics);
          const count = displayCount(live, module.showcaseCount);
          const title = t(module.labelKey);
          const subtitle = language === 'ar' ? module.labelEn : title;

          return (
            <Link
              key={module.id}
              to={module.route}
              className="command-center-module-tile group"
            >
              <div className={`command-center-module-tile__icon ${module.tint}`}>
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="command-center-module-tile__title">{title}</p>
              <p className="command-center-module-tile__subtitle">{subtitle}</p>
              <p className="command-center-module-tile__count">{count ?? '—'}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
