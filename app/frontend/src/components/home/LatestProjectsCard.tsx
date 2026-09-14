import { Link } from 'react-router-dom';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getProjectImageAsset } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  COMPACT_HOME_PROJECTS,
  FEATURED_HOME_PROJECT,
} from '@/data/homeProjects';
import { projectMessageKey } from '@/i18n/homeMessages';

export default function LatestProjectsCard() {
  const { t } = useLanguage();
  const featured = FEATURED_HOME_PROJECT;
  const featuredStatusKey =
    featured.status === 'active'
      ? 'project.status.active'
      : featured.status === 'completed'
        ? 'project.status.completed'
        : 'project.status.upcoming';

  return (
    <section
      className="eam-panel flex h-auto flex-col overflow-hidden lg:h-[330px] lg:shrink-0"
      aria-label={t('projects.aria')}
    >
      <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-[var(--eam-home-border)] px-3">
        <h2 className="text-[15px] font-bold text-[var(--eam-home-ink)]">{t('projects.title')}</h2>
        <Link to="/projects" className="text-[10px] font-medium text-[var(--eam-home-gold-deep)] hover:underline">
          {t('projects.cta')}
        </Link>
      </div>

      <div className="mx-2 mt-1 flex h-[116px] shrink-0 gap-1.5 overflow-hidden rounded-[12px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/60 p-1">
        <div className="relative h-full w-[48%] shrink-0 overflow-hidden rounded-[10px]">
          <ResponsiveImage
            asset={getProjectImageAsset(featured.imageKey)}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-1 py-0.5">
          <div className="mb-1 flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold leading-tight text-[var(--eam-home-ink)]">
                {t(projectMessageKey(featured.id, 'title'))}
              </p>
              <p className="text-[9px] text-[var(--eam-home-ink)]/60">
                {t(projectMessageKey(featured.id, 'location'))}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--eam-home-border)] px-1.5 py-0.5 text-[8px] font-semibold text-[var(--eam-home-gold-deep)]">
              {t(featuredStatusKey)}
            </span>
          </div>

          <div className="mt-auto">
            <div className="mb-0.5 flex items-center justify-between text-[9px] text-[var(--eam-home-ink)]/70">
              <span>{featured.progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[var(--eam-home-cream)]">
              <div
                className="h-full rounded-full bg-[var(--eam-home-gold)] transition-all"
                style={{ width: `${featured.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-1 flex-1 space-y-0.5 overflow-hidden px-2 pb-1.5">
        {COMPACT_HOME_PROJECTS.map((project) => {
          const statusKey =
            project.status === 'active'
              ? 'project.status.active'
              : project.status === 'completed'
                ? 'project.status.completed'
                : 'project.status.upcoming';
          return (
            <li
              key={project.id}
              className="flex h-[38px] items-center gap-1.5 rounded-[10px] border border-[var(--eam-home-border)]/55 bg-[var(--eam-home-cream-light)]/80 px-1.5"
            >
              <ResponsiveImage
                asset={getProjectImageAsset(project.imageKey)}
                className="h-8 w-8 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-[var(--eam-home-ink)]">
                  {t(projectMessageKey(project.id, 'title'))}
                </p>
                <p className="text-[8px] text-[var(--eam-home-ink)]/60">
                  {t(projectMessageKey(project.id, 'location'))}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--eam-home-border)] px-1.5 py-0.5 text-[8px] font-medium text-[var(--eam-home-gold-deep)]">
                {t(statusKey)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
