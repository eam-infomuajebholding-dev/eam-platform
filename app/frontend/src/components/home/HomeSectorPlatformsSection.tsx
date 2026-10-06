import { useMemo, useState } from 'react';
import { Layers, Route, Sparkles } from 'lucide-react';
import ServicesSectorCard from '@/components/services/ServicesSectorCard';
import SectorPlatformStrip from '@/components/home/SectorPlatformStrip';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import { useLanguage } from '@/contexts/LanguageContext';
import { SECTOR_DEFINITIONS } from '@/data/sectors';
import {
  SERVICE_CATEGORIES,
  filterSectorsByCategory,
  type ServiceCategoryId,
} from '@/data/serviceCategories';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/** Sector platforms hub — same visual system as homepage sections. */
export default function HomeSectorPlatformsSection() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryId>('all');
  const introReveal = useScrollReveal({ threshold: 0.1 });
  const gridReveal = useScrollReveal({ threshold: 0.06 });

  const visibleSectors = useMemo(
    () => filterSectorsByCategory(SECTOR_DEFINITIONS, activeCategory),
    [activeCategory],
  );

  const stats = [
    {
      icon: Layers,
      valueKey: 'page.services.stat.sectorsValue' as const,
      labelKey: 'page.services.stat.sectors' as const,
    },
    {
      icon: Route,
      valueKey: 'page.services.stat.journeysValue' as const,
      labelKey: 'page.services.stat.journeys' as const,
    },
    {
      icon: Sparkles,
      valueKey: 'page.services.stat.platformValue' as const,
      labelKey: 'page.services.stat.platform' as const,
    },
  ];

  return (
    <section
      id="home-sector-platforms"
      data-home-section="sector-platforms"
      className="home-sector-platforms home-section-block relative overflow-hidden bg-cream-light dark:bg-background"
      aria-label={t('page.services.platforms.hero.title')}
    >
      <div className="mx-auto w-full max-w-[1586px] px-3 sm:px-4 lg:px-[16px]">
        <div
          ref={introReveal.ref}
          className={`py-10 md:py-14 ${introReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="home-what-we-offer__section-meta mx-auto max-w-3xl justify-center">
            <span className="home-what-we-offer__section-rule home-what-we-offer__section-rule--long" aria-hidden />
            <span className="home-what-we-offer__section-id">
              <span className="home-what-we-offer__section-mark" aria-hidden>
                —
              </span>
              <span className="home-what-we-offer__section-num">16</span>
            </span>
            <span className="home-what-we-offer__section-rule home-what-we-offer__section-rule--short" aria-hidden />
          </div>

          <h2 className="home-what-we-offer__title mx-auto max-w-3xl text-center">
            {t('page.services.platforms.hero.title')}
          </h2>
          <p className="text-lead mx-auto mt-4 max-w-3xl text-center">{t('page.services.platforms.intro')}</p>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ icon: Icon, valueKey, labelKey }) => (
              <div
                key={labelKey}
                className="rounded-2xl border border-soft-border/60 bg-cream px-5 py-6 text-center shadow-gold-card dark:bg-surface"
              >
                <Icon className="mx-auto mb-3 h-6 w-6 text-gold-500" strokeWidth={1.75} />
                <p className="font-display text-3xl font-semibold text-gold-600 dark:text-gold-300">
                  {t(valueKey)}
                </p>
                <p className="text-caption mt-1">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="services-sector-marquee pb-8 md:pb-10">
          <div className="home-rails-panel mx-auto w-full">
            <SectorPlatformStrip />
          </div>
        </div>

        <div
          ref={gridReveal.ref}
          id="services-sector-platforms"
          className={`pb-12 md:pb-16 ${gridReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="mb-8 text-center md:mb-10">
            <h3 className="font-display text-display-sm text-ink md:text-display-md">
              {t('page.services.grid.title')}
            </h3>
            <p className="text-body mx-auto mt-3 max-w-2xl">{t('page.services.grid.subtitle')}</p>
          </div>

          <div
            className="mb-10 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label={t('page.services.grid.title')}
          >
            {SERVICE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gold-500 text-white shadow-gold'
                    : 'border border-soft-border/80 bg-cream-light text-ink-secondary hover:border-gold-300 hover:bg-gold-50 dark:bg-surface dark:text-ink-secondary'
                }`}
              >
                {t(category.labelKey)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleSectors.map((sector) => (
              <ServicesSectorCard key={sector.slug} sector={sector} />
            ))}
          </div>
        </div>
      </div>
      <HomeSectionBottomFade to="cream" rounded />
    </section>
  );
}
