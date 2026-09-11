import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAROUSEL_HOME_PROJECTS } from '@/data/homeProjects';
import { getProjectImage } from '@/data/homeAssets';

export default function FeaturedProjectsCarousel() {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const maxIndex = Math.max(0, CAROUSEL_HOME_PROJECTS.length - visible);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section
      className="eam-panel flex h-auto flex-col overflow-hidden lg:h-[208px] lg:shrink-0"
      aria-label="مشاريع مميزة"
    >
      <div className="flex h-[30px] shrink-0 items-center justify-between border-b border-[var(--eam-home-border)] px-3">
        <h2 className="font-tajawal text-[14px] font-bold text-[var(--eam-home-ink)]">مشاريع مميزة</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            aria-label="السابق"
            className="rounded-full border border-[var(--eam-home-border)] p-0.5 text-[var(--eam-home-ink)] disabled:opacity-40"
          >
            <ChevronRight size={12} />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index >= maxIndex}
            aria-label="التالي"
            className="rounded-full border border-[var(--eam-home-border)] p-0.5 text-[var(--eam-home-ink)] disabled:opacity-40"
          >
            <ChevronLeft size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-1.5 overflow-hidden px-2.5 py-2">
        {CAROUSEL_HOME_PROJECTS.slice(index, index + visible).map((project) => (
          <article
            key={project.id}
            className="relative min-w-0 flex-1 overflow-hidden rounded-[14px] border border-[var(--eam-home-border)]"
          >
            <img
              src={getProjectImage(project.id)}
              alt={`صورة مشروع ${project.title}`}
              className="h-[112px] w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2B2118]/92 via-[#2B2118]/45 to-transparent px-2 py-2">
              <p className="truncate text-[10px] font-bold text-white">{project.title}</p>
              <p className="truncate text-[9px] text-white/75">{project.location}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex h-[30px] shrink-0 items-center justify-center border-t border-[var(--eam-home-border)]">
        <Link to="/projects" className="text-[10px] font-semibold text-[var(--eam-home-gold-deep)] hover:underline">
          عرض جميع المشاريع
        </Link>
      </div>
    </section>
  );
}
