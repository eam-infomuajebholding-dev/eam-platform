import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { SECTOR_DEFINITIONS } from '@/data/sectors';
import PlatformExploreCard from '@/components/home/PlatformExploreCard';

/** Exploratory grid over canonical sector registry — WO-021 B15 */
export default function HomePlatformsGridSection() {
  const headerReveal = useScrollReveal({ threshold: 0.2 });
  const gridReveal = useScrollReveal({ threshold: 0.08 });
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-solutions"
      data-home-section="platforms-grid"
      className="home-platforms-section home-section-block"
      aria-label={t('platforms.aria')}
    >
      <div className="container mx-auto px-4">
        <header
          ref={headerReveal.ref}
          dir={direction}
          className={`home-platforms-header ${headerReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="home-platforms-header__meta">
            <p className="home-platforms-eyebrow">{t('platforms.eyebrow')}</p>
            <span className="home-platforms-stat">{t('platforms.stat')}</span>
          </div>
          <h2 className="home-platforms-title">{t('platforms.title')}</h2>
          <p className="home-platforms-subtitle">{t('platforms.subtitle')}</p>
        </header>

        <div
          ref={gridReveal.ref}
          className={`home-platforms-grid ${gridReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          {SECTOR_DEFINITIONS.map((sector) => (
            <PlatformExploreCard key={sector.slug} sector={sector} />
          ))}
        </div>
      </div>
    </section>
  );
}
