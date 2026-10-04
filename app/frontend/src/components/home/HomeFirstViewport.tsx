import HomeLightHero from '@/components/home/HomeLightHero';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import { useLanguage } from '@/contexts/LanguageContext';

/** Section 01 — hero first screen; flows into section 02 via visual bridge. */
export default function HomeFirstViewport() {
  const { t } = useLanguage();

  return (
    <section
      id="home-command-center"
      data-home-section="first-viewport"
      className="home-first-viewport-section home-first-viewport-section--hero-only"
      aria-label={t('home.firstViewport.aria')}
    >
      <div className="home-first-screen home-first-screen--video-full relative z-10 mx-auto w-full max-w-[1586px] px-3 sm:px-4 lg:px-[16px]">
        <div className="home-first-screen__stack home-first-screen__stack--video-full">
          <div className="home-first-screen__hero">
            <HomeLightHero />
          </div>
          <HomeSectionBottomFade to="cream-light" rounded />
        </div>
      </div>
    </section>
  );
}
