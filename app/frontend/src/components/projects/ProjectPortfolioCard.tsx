import { ArrowUpRight, Building2, Calendar, MapPin, X } from 'lucide-react';
import type { MessageKey } from '@/i18n/messages';

export type PortfolioProject = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  year: string;
  image: string;
  status: 'active' | 'completed' | 'upcoming';
};

type Variant = 'featured' | 'standard' | 'wide';

type Props = {
  project: PortfolioProject;
  variant?: Variant;
  gradientClass: string;
  statusLabel: string;
  statusTone: string;
  viewDetailsLabel: string;
  className?: string;
  isEditMode?: boolean;
  onView: () => void;
  onDelete?: () => void;
  isRtl?: boolean;
};

function ProjectImage({
  project,
  gradientClass,
  variant,
}: {
  project: PortfolioProject;
  gradientClass: string;
  variant: Variant;
}) {
  const height =
    variant === 'featured' ? 'absolute inset-0 h-full w-full' : variant === 'wide' ? 'h-full w-full' : 'h-full w-full';

  if (project.image) {
    return (
      <img
        src={project.image}
        alt={project.title}
        className={`${height} object-cover transition duration-700 group-hover:scale-[1.04] motion-reduce:transform-none`}
      />
    );
  }

  return (
    <div className={`${height} flex items-center justify-center bg-gradient-to-br ${gradientClass}`}>
      <Building2
        className={variant === 'featured' ? 'h-20 w-20 text-white/30' : 'h-14 w-14 text-white/30'}
        strokeWidth={1.25}
      />
    </div>
  );
}

export function statusToneClass(status: PortfolioProject['status']): string {
  if (status === 'active') return 'border-gold/40 bg-gold/15 text-gold-600 dark:text-gold';
  if (status === 'completed') return 'border-stone-400/30 bg-stone-500/10 text-ink-secondary';
  return 'border-gold-300/40 bg-gold-50/90 text-gold-600 dark:bg-gold/10 dark:text-gold-300';
}

export function statusMessageKey(status: PortfolioProject['status']): MessageKey {
  if (status === 'active') return 'project.status.active';
  if (status === 'completed') return 'project.status.completed';
  return 'project.status.upcoming';
}

export const GRADIENT_VARIANTS = [
  'from-gold-600 to-gold-300',
  'from-gold-500 to-gold-200',
  'from-stone-700 to-stone-500',
  'from-stone-800 to-gold-600',
] as const;

export default function ProjectPortfolioCard({
  project,
  variant = 'standard',
  gradientClass,
  statusLabel,
  statusTone,
  viewDetailsLabel,
  className = '',
  isEditMode = false,
  onView,
  onDelete,
  isRtl = true,
}: Props) {
  const statusBadge = (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${statusTone}`}
    >
      {statusLabel}
    </span>
  );

  if (variant === 'wide') {
    return (
      <article
        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-soft-border/80 bg-cream-light shadow-gold transition duration-300 hover:border-gold hover:shadow-gold-card dark:bg-surface sm:flex-row ${className}`}
        onClick={onView}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {isEditMode && onDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute start-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
            aria-label="Delete"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-[42%] sm:min-h-[240px]">
          <ProjectImage project={project} gradientClass={gradientClass} variant={variant} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-7">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {statusBadge}
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">{project.category}</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-ink md:text-2xl">{project.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
                {project.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
                {project.year}
              </span>
            </div>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition group-hover:text-gold">
            {viewDetailsLabel}
            <ArrowUpRight className={`h-4 w-4 ${isRtl ? '-scale-x-100' : ''}`} strokeWidth={2} />
          </span>
        </div>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article
        className={`group relative flex min-h-[360px] cursor-pointer overflow-hidden rounded-2xl border border-soft-border/80 shadow-gold transition duration-300 hover:border-gold hover:shadow-gold-card lg:min-h-[520px] ${className}`}
        onClick={onView}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {isEditMode && onDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute start-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
            aria-label="Delete"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <ProjectImage project={project} gradientClass={gradientClass} variant={variant} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/95 via-[#1c1917]/45 to-[#1c1917]/10" />
        <div className="relative mt-auto flex w-full flex-col p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {statusBadge}
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-200 backdrop-blur-sm">
              {project.category}
            </span>
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold-200" strokeWidth={1.75} />
              {project.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold-200" strokeWidth={1.75} />
              {project.year}
            </span>
          </div>
          <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-gold group-hover:text-[#2B2118]">
            {viewDetailsLabel}
            <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? '-scale-x-100' : ''}`} strokeWidth={2} />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-soft-border/80 bg-cream-light shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-gold dark:bg-surface ${className}`}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {isEditMode && onDelete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute start-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
          aria-label="Delete"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProjectImage project={project} gradientClass={gradientClass} variant={variant} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/75 via-transparent to-transparent" />
        <div className="absolute start-3 top-3">{statusBadge}</div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-200">{project.category}</p>
          <h3 className="mt-0.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-white">
            {project.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-ink-muted">{project.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-soft-border/60 pt-3 text-[10px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gold" strokeWidth={1.75} />
            {project.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gold" strokeWidth={1.75} />
            {project.year}
          </span>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-600 group-hover:text-gold">
          {viewDetailsLabel}
          <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? '-scale-x-100' : ''}`} strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}
