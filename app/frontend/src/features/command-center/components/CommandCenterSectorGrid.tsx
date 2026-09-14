import { Link } from 'react-router-dom';
import { SECTOR_DEFINITIONS } from '@/data/sectors';
import { useLanguage } from '@/contexts/LanguageContext';
import { sectorMessageKey } from '@/i18n/homeMessages';
import type { JourneyMetricRow } from '@/features/command-center/types';

type Props = {
  journeyMetrics: JourneyMetricRow[];
};

export default function CommandCenterSectorGrid({ journeyMetrics }: Props) {
  const { t } = useLanguage();
  const counts = new Map(
    journeyMetrics.map((row) => [row.journey_type, row.service_request_count + row.active_count]),
  );

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">{t('commandCenter.sectors.title')}</h3>
          <p className="text-sm text-ink-secondary">{t('commandCenter.sectors.subtitle')}</p>
        </div>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-700">
          {SECTOR_DEFINITIONS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {SECTOR_DEFINITIONS.map((sector) => {
          const Icon = sector.icon;
          const title = t(sectorMessageKey(sector.slug));
          const metric = journeyMetrics.find((row) => row.label_ar === title);
          const count = metric?.service_request_count ?? counts.get(sector.slug) ?? 0;

          return (
            <Link
              key={sector.slug}
              to={sector.route}
              className="group rounded-xl border border-soft-border/70 bg-cream-light/70 p-3 transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md dark:bg-surface-muted"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/12 text-gold-700">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <p className="line-clamp-2 text-xs font-semibold leading-5 text-ink group-hover:text-gold-700 dark:text-white">
                {title}
              </p>
              <p className="mt-2 text-[11px] font-bold text-gold-600">{count}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
