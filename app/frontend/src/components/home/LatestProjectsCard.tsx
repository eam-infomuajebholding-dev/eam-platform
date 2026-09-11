import { Link } from 'react-router-dom';
import {
  COMPACT_HOME_PROJECTS,
  FEATURED_HOME_PROJECT,
  STATUS_LABELS,
} from '@/data/homeProjects';
import { getProjectImage } from '@/data/homeAssets';

export default function LatestProjectsCard() {
  const featured = FEATURED_HOME_PROJECT;

  return (
    <section
      className="eam-panel flex h-auto flex-col overflow-hidden lg:h-[330px] lg:shrink-0"
      aria-label="آخر المشاريع"
    >
      <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-[var(--eam-home-border)] px-3">
        <h2 className="font-tajawal text-[15px] font-bold text-[var(--eam-home-ink)]">آخر المشاريع</h2>
        <Link to="/projects" className="text-[10px] font-medium text-[var(--eam-home-gold-deep)] hover:underline">
          عرض الكل
        </Link>
      </div>

      <div className="mx-2 mt-1 flex h-[116px] shrink-0 gap-1.5 overflow-hidden rounded-[12px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/60 p-1">
        <div className="relative h-full w-[48%] shrink-0 overflow-hidden rounded-[10px]">
          <img
            src={getProjectImage(featured.id)}
            alt={`صورة مشروع ${featured.title}`}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-1 py-0.5">
          <div className="mb-1 flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold leading-tight text-[var(--eam-home-ink)]">
                {featured.title}
              </p>
              <p className="text-[9px] text-[var(--eam-home-ink)]/60">{featured.location}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--eam-home-border)] px-1.5 py-0.5 text-[8px] font-semibold text-[var(--eam-home-gold-deep)]">
              {STATUS_LABELS[featured.status]}
            </span>
          </div>

          <div className="mt-auto">
            <div className="mb-0.5 flex items-center justify-between text-[9px] text-[var(--eam-home-ink)]/70">
              <span>التقدم</span>
              <span className="font-semibold text-[var(--eam-home-gold-deep)]">{featured.progress}%</span>
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
        {COMPACT_HOME_PROJECTS.map((project) => (
          <li
            key={project.id}
            className="flex h-[38px] items-center gap-1.5 rounded-[10px] border border-[var(--eam-home-border)]/55 bg-[var(--eam-home-cream-light)]/80 px-1.5"
          >
            <img
              src={getProjectImage(project.id)}
              alt={`صورة مشروع ${project.title}`}
              className="h-8 w-8 shrink-0 rounded-lg object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-[var(--eam-home-ink)]">{project.title}</p>
              <p className="text-[8px] text-[var(--eam-home-ink)]/60">{project.location}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--eam-home-border)] px-1.5 py-0.5 text-[8px] font-medium text-[var(--eam-home-gold-deep)]">
              {STATUS_LABELS[project.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
