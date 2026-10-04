import { Link } from 'react-router-dom';
import type { ProjectImageKey } from '@/config/assetKeys';
import { getProjectImageAsset } from '@/config/assets';
import type { HomeMessageKey } from '@/i18n/homeMessages';
import type { JourneyMetricRow } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const FEATURED: {
  projectKey: '1' | '2' | '3' | '4';
  imageKey: ProjectImageKey;
  inProgressDefault: boolean;
}[] = [
  { projectKey: '1', imageKey: 'luxuryResidential', inProgressDefault: true },
  { projectKey: '2', imageKey: 'businessCenter', inProgressDefault: true },
  { projectKey: '3', imageKey: 'specializedHospital', inProgressDefault: false },
  { projectKey: '4', imageKey: 'commercialTower', inProgressDefault: true },
];

type Props = {
  journeyMetrics: JourneyMetricRow[];
};

export default function CommandCenterFeaturedProjects({ journeyMetrics }: Props) {
  const { t, isRTL } = useLanguage();
  const hasActive = journeyMetrics.some((row) => row.active_count > 0);

  return (
    <section className="command-center-panel command-center-featured h-full">
      <h3 className="command-center-panel__title">{t('commandCenter.featured.title')}</h3>
      <ul className="space-y-2.5">
        {FEATURED.map(({ projectKey, imageKey, inProgressDefault }) => {
          const titleKey = `project.${projectKey}.title` as HomeMessageKey;
          const locationKey = `project.${projectKey}.location` as HomeMessageKey;
          const asset = getProjectImageAsset(imageKey);
          const inProgress = hasActive ? inProgressDefault : false;
          const status = inProgress
            ? t('commandCenter.featured.inProgress')
            : t('commandCenter.featured.completed');

          return (
            <li key={projectKey}>
              <Link
                to="/projects"
                className="command-center-featured__row group"
              >
                <img
                  src={asset.src}
                  alt=""
                  className="command-center-featured__thumb"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink group-hover:text-gold-800 dark:text-white">
                    {t(titleKey)}
                  </p>
                  <p className="text-[11px] text-ink-muted">{t(locationKey)}</p>
                </div>
                <span
                  className={cn(
                    'command-center-featured__badge',
                    inProgress ? 'command-center-featured__badge--progress' : 'command-center-featured__badge--done',
                  )}
                >
                  {status}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
