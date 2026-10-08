import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import ProjectCard from '@/components/home/ProjectCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { FEATURED_HOME_PROJECTS } from '@/data/homeProjects';
import { projectMessageKey } from '@/i18n/homeMessages';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import HomeSectionTopFigure from '@/components/home/HomeSectionTopFigure';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PORTFOLIO_STATS = [
  { valueKey: 'projects.stat1.value' as const, labelKey: 'projects.stat1.label' as const },
  { valueKey: 'projects.stat2.value' as const, labelKey: 'projects.stat2.label' as const },
  { valueKey: 'projects.stat3.value' as const, labelKey: 'projects.stat3.label' as const },
] as const;

/** 06 — Featured projects portfolio. */
export default function ProjectsShowcaseSection() {
  const headerReveal = useScrollReveal({ threshold: 0.15 });
  const gridReveal = useScrollReveal({ threshold: 0.08 });
  const { t, direction } = useLanguage();

  const [featured, ...rest] = FEATURED_HOME_PROJECTS;
  const portfolioCategories = FEATURED_HOME_PROJECTS.map((project) =>
    t(projectMessageKey(project.id, 'category')),
  );

  return (
    <section
      id="home-projects-showcase"
      data-home-section="projects-showcase"
      className="home-projects-showcase home-section-block relative overflow-hidden"
      aria-label={t('projects.aria')}
    >
      <div className="home-projects-showcase__shell">
        <div
          ref={headerReveal.ref}
          className={`home-projects-showcase__header mb-10 md:mb-12 ${headerReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className={`lg:col-span-7 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--eam-home-gold-deep)]">
                <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
                {t('projects.eyebrow')}
              </p>
              <h2 className="font-display text-3xl font-semibold leading-tight text-[var(--eam-home-ink)] md:text-4xl lg:text-[2.65rem]">
                {t('projects.title')}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--eam-home-ink)]/70 md:text-base">
                {t('projects.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-5 lg:gap-4">
              {PORTFOLIO_STATS.map((stat) => (
                <div
                  key={stat.labelKey}
                  className="rounded-2xl border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/90 px-3 py-4 text-center shadow-[var(--eam-home-shadow)] backdrop-blur-sm sm:px-4"
                >
                  <p className="font-display text-2xl font-semibold tabular-nums text-[var(--eam-home-gold-deep)] md:text-3xl">
                    {t(stat.valueKey)}
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-snug text-[var(--eam-home-ink)]/60 sm:text-xs">
                    {t(stat.labelKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {portfolioCategories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/80 px-3.5 py-1.5 text-[11px] font-medium text-[var(--eam-home-ink)]/80 shadow-sm"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={gridReveal.ref}
          className={`home-projects-showcase__grid grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] ${gridReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <ProjectCard project={featured} variant="featured" className="lg:col-span-7 lg:row-span-2" />
          {rest.slice(0, 2).map((project) => (
            <ProjectCard key={project.id} project={project} variant="standard" className="lg:col-span-5" />
          ))}
          {rest[2] ? (
            <ProjectCard project={rest[2]} variant="wide" className="lg:col-span-12" />
          ) : null}
        </div>

        <div className="home-projects-showcase__cta mt-10 flex justify-center md:mt-12">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--eam-home-gold)]/50 bg-[var(--eam-home-cream-light)] px-7 py-3 text-sm font-semibold text-[var(--eam-home-gold-deep)] shadow-[var(--eam-home-shadow)] transition hover:border-[var(--eam-home-gold)] hover:bg-[var(--eam-home-gold)] hover:text-[#2B2118] hover:shadow-gold-sm"
          >
            {t('projects.cta')}
            <ArrowLeft
              className={`h-4 w-4 transition group-hover:translate-x-0.5 ${direction === 'ltr' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:-translate-x-0.5'}`}
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
      <HomeSectionBottomFade to="cream-light" />
    </section>
  );
}
