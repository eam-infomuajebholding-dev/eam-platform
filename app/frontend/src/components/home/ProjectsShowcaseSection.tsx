import { Link } from 'react-router-dom';
import { ArrowLeft, Layers3 } from 'lucide-react';
import { CAROUSEL_HOME_PROJECTS, STATUS_LABELS } from '@/data/homeProjects';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PORTFOLIO_CATEGORIES = Array.from(new Set(CAROUSEL_HOME_PROJECTS.map((p) => p.category)));

export default function ProjectsShowcaseSection() {
  const reveal = useScrollReveal({ threshold: 0.12 });

  return (
    <section
      id="home-projects-showcase"
      data-home-section="projects-showcase"
      className="border-t border-[var(--eam-home-border)]/40 bg-[var(--eam-home-cream-light)] py-16 md:py-20"
      aria-label="استكشاف المشاريع"
    >
      <div className="container mx-auto px-4">
        <div ref={reveal.ref} className={reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}>
          <div className="mb-10 flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-right">
            <div>
              <h2 className="font-tajawal text-3xl font-bold text-[var(--eam-home-ink)] md:text-4xl">
                محفظة المشاريع
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--eam-home-ink)]/70">
                اكتشف مجالات المشاريع والقطاعات التي نخدمها — عرض استكشافي أوسع من لوحة
                المشاريع في الشاشة الأولى.
              </p>
            </div>
            <Layers3 className="hidden h-10 w-10 text-[var(--eam-home-gold)]/50 md:block" strokeWidth={1.5} />
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-2 md:justify-start">
            {PORTFOLIO_CATEGORIES.map((category) => (
              <span
                key={category}
                className="rounded-full border border-[var(--eam-home-border)] bg-white/80 px-4 py-1.5 text-xs font-medium text-[var(--eam-home-ink)]"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3 md:min-w-0 md:grid md:grid-cols-3 md:gap-4">
              {CAROUSEL_HOME_PROJECTS.map((project) => (
                <article
                  key={`showcase-${project.id}`}
                  className="w-[240px] shrink-0 rounded-2xl border border-[var(--eam-home-border)] bg-white/90 p-4 md:w-auto"
                >
                  <p className="text-[10px] font-medium text-[var(--eam-home-gold-deep)]">{project.category}</p>
                  <h3 className="mt-1 font-tajawal text-base font-bold text-[var(--eam-home-ink)]">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[var(--eam-home-ink)]/60">{project.location}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <span className="rounded-full border border-[var(--eam-home-border)] px-2 py-0.5 text-[var(--eam-home-gold-deep)]">
                      {STATUS_LABELS[project.status]}
                    </span>
                    <span className="text-[var(--eam-home-ink)]/55">{project.progress}%</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--eam-home-border)] px-6 py-2.5 text-sm font-semibold text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)]"
            >
              استكشف جميع المشاريع
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
