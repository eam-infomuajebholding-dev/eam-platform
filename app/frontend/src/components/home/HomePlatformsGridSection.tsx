import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SECTOR_DEFINITIONS } from '@/data/sectors';

/** Display grid over canonical sector registry — not a second data source (WO-021 B15) */
export default function HomePlatformsGridSection() {
  const titleReveal = useScrollReveal({ threshold: 0.2 });
  const gridReveal = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="home-solutions"
      data-home-section="platforms-grid"
      className="bg-[var(--eam-home-cream)] py-16 md:py-20"
      aria-label="خدماتنا"
    >
      <div className="container mx-auto px-4">
        <div ref={titleReveal.ref} className={titleReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}>
          <h2 className="mb-4 text-center font-tajawal text-3xl font-bold text-[var(--eam-home-ink)] md:text-4xl">
            حلول متكاملة لرحلة أكثر نجاحاً
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-7 text-[var(--eam-home-ink)]/70 md:text-base">
            عرض تفصيلي لمنصات EAM — نفس مصدر القطاعات أعلاه، بصيغة استكشافية.
          </p>
        </div>

        <div
          ref={gridReveal.ref}
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${gridReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          {SECTOR_DEFINITIONS.map((sector) => {
            const Icon = sector.icon;
            return (
              <Link
                key={sector.slug}
                to={sector.route}
                data-sector-slug={sector.slug}
                className="group flex gap-4 rounded-2xl border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/90 p-5 transition hover:-translate-y-0.5 hover:border-[var(--eam-home-gold)] hover:shadow-[0_6px_18px_rgba(198,138,42,0.12)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--eam-home-gold)]/10">
                  <Icon className="h-5 w-5 text-[var(--eam-home-gold-deep)]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[var(--eam-home-gold-deep)]">
                    {String(sector.number).padStart(2, '0')}
                  </p>
                  <h3 className="font-tajawal text-base font-bold text-[var(--eam-home-ink)] group-hover:text-[var(--eam-home-gold-deep)]">
                    {sector.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
