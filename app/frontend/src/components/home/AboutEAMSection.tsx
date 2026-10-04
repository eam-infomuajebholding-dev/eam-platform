import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/** 02 — About EAM (ivory band after hero). */
export default function AboutEAMSection() {
  const reveal = useScrollReveal({ threshold: 0.08 });
  const aboutImage = getHomeImage('aboutEam');
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-about"
      data-home-section="about-eam"
      className="home-about-eam home-section-block"
      aria-label={t('about.aria')}
    >
      <div className="home-about-eam__inner mx-auto w-full max-w-[1586px] px-3 sm:px-4 lg:px-[16px]">
        <div
          ref={reveal.ref}
          className={`home-about-eam__stage ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="home-about-eam__visual">
            <ResponsiveImage
              asset={aboutImage}
              className="home-about-eam__visual-img"
              loading="lazy"
              width={1600}
              height={900}
            />
          </div>

          <div className="home-about-eam__copy" dir={direction}>
            <div className="home-about-eam__eyebrow">
              <span className="home-about-eam__eyebrow-line" aria-hidden />
              <span className="home-about-eam__eyebrow-text">{t('about.eyebrow')}</span>
              <span className="home-about-eam__eyebrow-line" aria-hidden />
            </div>
            <h2 className="home-about-eam__title">{t('about.headline')}</h2>
            <p className="home-about-eam__tagline">{t('about.taglineEn')}</p>
            <blockquote className="home-about-eam__body">
              <p>{t('about.body')}</p>
            </blockquote>
            <Link to="/about" className="home-about-eam__cta group">
              {t('about.cta')}
              <ArrowLeft
                className={`h-4 w-4 transition group-hover:translate-x-0.5 ${direction === 'ltr' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:-translate-x-0.5'}`}
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
      <HomeSectionBottomFade to="cream-light" />
    </section>
  );
}
