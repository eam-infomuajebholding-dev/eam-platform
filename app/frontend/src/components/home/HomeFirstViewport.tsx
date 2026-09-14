import HomeLightHero from '@/components/home/HomeLightHero';
import HomeQuickActionsStrip from '@/components/home/HomeQuickActionsStrip';
import HomeStatsRibbon from '@/components/home/HomeStatsRibbon';
import SectorPlatformStrip from '@/components/home/SectorPlatformStrip';
import { useLanguage } from '@/contexts/LanguageContext';

/** Section 01 — approved light homepage first viewport */
export default function HomeFirstViewport() {
  const { t } = useLanguage();

  return (
    <section
      id="home-command-center"
      data-home-section="first-viewport"
      aria-label={t('home.firstViewport.aria')}
    >
      <div className="home-first-viewport-shell relative z-10 mx-auto w-full max-w-[1586px] px-3 sm:px-4 lg:px-[16px]">
        <HomeLightHero />

        <div className="home-rails-panel">
          <div className="home-rails-panel__rail">
            <HomeQuickActionsStrip />
          </div>
          <div className="home-rails-panel__rail">
            <SectorPlatformStrip />
          </div>
        </div>

        <HomeStatsRibbon />
      </div>
    </section>
  );
}
