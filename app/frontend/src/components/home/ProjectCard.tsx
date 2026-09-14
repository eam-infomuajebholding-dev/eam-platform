import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getProjectImageAsset } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HomeProject } from '@/data/homeProjects';
import { projectMessageKey } from '@/i18n/homeMessages';
import type { MessageKey } from '@/i18n/messages';

type ProjectCardVariant = 'featured' | 'standard' | 'wide';

type Props = {
  project: HomeProject;
  variant?: ProjectCardVariant;
  className?: string;
  to?: string;
};

function statusKeyFor(status: HomeProject['status']): MessageKey {
  if (status === 'active') return 'project.status.active';
  if (status === 'completed') return 'project.status.completed';
  return 'project.status.upcoming';
}

function statusTone(status: HomeProject['status']): string {
  if (status === 'active') {
    return 'border-gold/40 bg-gold/15 text-[var(--eam-home-gold-deep)]';
  }
  if (status === 'completed') {
    return 'border-stone-400/30 bg-stone-500/10 text-ink-secondary';
  }
  return 'border-gold-300/40 bg-gold-50/80 text-gold-600';
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--eam-home-gold-deep)] to-[var(--eam-home-gold)] transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  variant = 'standard',
  className = '',
  to = '/projects',
}: Props) {
  const { t, direction } = useLanguage();
  const image = getProjectImageAsset(project.imageKey);
  const statusKey = statusKeyFor(project.status);
  const isRtl = direction === 'rtl';

  const category = t(projectMessageKey(project.id, 'category'));
  const title = t(projectMessageKey(project.id, 'title'));
  const location = t(projectMessageKey(project.id, 'location'));
  const summary = t(projectMessageKey(project.id, 'summary'));

  const statusBadge = (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${statusTone(project.status)}`}
    >
      {t(statusKey)}
    </span>
  );

  if (variant === 'wide') {
    return (
      <Link
        to={to}
        className={`home-project-card home-project-card--wide group relative flex overflow-hidden rounded-2xl border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] shadow-[var(--eam-home-shadow)] transition duration-300 hover:border-[var(--eam-home-gold)] hover:shadow-gold ${className}`}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:w-[42%] sm:min-h-[220px]">
          <ResponsiveImage
            asset={image}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-[#1c1917]/20" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6 md:p-7">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {statusBadge}
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--eam-home-gold-deep)]">
                {category}
              </span>
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--eam-home-ink)] md:text-2xl">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--eam-home-ink)]/65">{summary}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--eam-home-ink)]/55">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--eam-home-gold)]" strokeWidth={1.75} />
              {location}
            </p>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--eam-home-ink)]/55">
                <span>{t('project.progressLabel')}</span>
                <span className="font-semibold tabular-nums text-[var(--eam-home-gold-deep)]">
                  {project.progress}%
                </span>
              </div>
              <ProgressBar value={project.progress} />
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--eam-home-border)] bg-white/80 text-[var(--eam-home-gold-deep)] transition group-hover:border-[var(--eam-home-gold)] group-hover:bg-[var(--eam-home-gold)] group-hover:text-[#2B2118]">
              <ArrowUpRight className={`h-4 w-4 ${isRtl ? '-scale-x-100' : ''}`} strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        to={to}
        className={`home-project-card home-project-card--featured group relative flex min-h-[360px] overflow-hidden rounded-2xl border border-[var(--eam-home-border)] shadow-[var(--eam-home-shadow)] transition duration-300 hover:border-[var(--eam-home-gold)] hover:shadow-gold lg:min-h-[520px] ${className}`}
      >
        <ResponsiveImage
          asset={image}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/95 via-[#1c1917]/45 to-[#1c1917]/15" />
        <div className="relative mt-auto flex w-full flex-col p-5 sm:p-7 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {statusBadge}
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--eam-home-gold-soft)] backdrop-blur-sm">
              {category}
            </span>
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
            {title}
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">{summary}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/60">
            <MapPin className="h-3.5 w-3.5 text-[var(--eam-home-gold-soft)]" strokeWidth={1.75} />
            {location}
          </p>
          <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-white/55">
                <span>{t('project.progressLabel')}</span>
                <span className="font-semibold tabular-nums text-[var(--eam-home-gold-soft)]">
                  {project.progress}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--eam-home-gold-deep)] to-[var(--eam-home-gold-soft)]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-[var(--eam-home-gold)] group-hover:text-[#2B2118]">
              {t('project.viewDetails')}
              <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? '-scale-x-100' : ''}`} strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`home-project-card group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] shadow-[var(--eam-home-shadow)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--eam-home-gold)] hover:shadow-gold ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ResponsiveImage
          asset={image}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/70 via-transparent to-transparent opacity-90" />
        <div className="absolute start-3 top-3">{statusBadge}</div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--eam-home-gold-soft)]">
            {category}
          </p>
          <h3 className="mt-0.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-white">{title}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-[var(--eam-home-ink)]/60">{summary}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--eam-home-border)]/60 pt-3">
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--eam-home-ink)]/55">
            <MapPin className="h-3 w-3 text-[var(--eam-home-gold)]" strokeWidth={1.75} />
            {location}
          </span>
          <span className="font-semibold tabular-nums text-[10px] text-[var(--eam-home-gold-deep)]">
            {project.progress}%
          </span>
        </div>
        <ProgressBar value={project.progress} className="mt-2" />
      </div>
    </Link>
  );
}
