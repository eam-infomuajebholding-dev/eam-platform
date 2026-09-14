import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SECTOR_DEFINITIONS } from '@/data/sectors';
import { sectorMessageKey } from '@/i18n/homeMessages';
import type { JourneyMetricRow } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type Props = {
  journeyMetrics: JourneyMetricRow[];
};

export default function CommandCenterFeaturedProjects({ journeyMetrics }: Props) {
  const { t, isRTL } = useLanguage();

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface">
      <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">{t('commandCenter.featured.title')}</h3>
      <ul className="space-y-3">
        {SECTOR_DEFINITIONS.slice(0, 4).map((sector, index) => {
          const journey = journeyMetrics[index];
          const inProgress = journey ? journey.active_count > 0 : false;
          const status = inProgress
            ? t('commandCenter.featured.inProgress')
            : t('commandCenter.featured.completed');

          return (
            <li
              key={sector.slug}
              className="flex items-center justify-between gap-3 rounded-xl border border-soft-border/70 bg-cream-light/70 px-3 py-2.5 dark:bg-surface-muted"
            >
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">
                      {t(sectorMessageKey(sector.slug))}
                </p>
                <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-ink/70 ring-1 ring-soft-border dark:bg-surface">
                  {status}
                </span>
              </div>
              <Link
                to={sector.route}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
              >
                {t('commandCenter.viewDetails')}
                <ArrowRight className={cn('h-3.5 w-3.5', isRTL && 'rotate-180')} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
