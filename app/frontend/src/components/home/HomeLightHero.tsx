import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';

const HERO_LOGO_SRC = '/assets/eam-emblem-transparent.png';

/** Full-bleed hero — emblem pinned top-right. */
export default function HomeLightHero() {
  const hero = getHomeImage('hero');
  const { t } = useLanguage();

  return (
    <div className="home-hero-block">
      <section
        id="home-hero"
        role="region"
        data-home-section="hero"
        className="home-light-hero relative min-h-[400px] overflow-hidden rounded-[20px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] shadow-[0_4px_24px_rgba(139,77,0,0.08)] sm:min-h-[440px] lg:min-h-[480px]"
        aria-label={t('hero.aria')}
      >
        {/* Full-bleed background */}
        <div className="absolute inset-0" aria-hidden="true">
          <ResponsiveImage
            asset={hero}
            className="home-hero-bg-img h-full w-full object-cover"
            priority
            width={1800}
            height={900}
          />
        </div>

        <img
          src={HERO_LOGO_SRC}
          alt={t('brand.logoAlt')}
          className="home-hero-emblem-img absolute right-0 top-0 z-[2] block"
          loading="eager"
          decoding="async"
        />
      </section>
    </div>
  );
}
