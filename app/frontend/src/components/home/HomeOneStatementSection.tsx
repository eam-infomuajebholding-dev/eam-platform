import { Cpu, HardHat, Settings2, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import HomeSectionTopFigure from '@/components/home/HomeSectionTopFigure';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PILLARS = [
  { key: 'oneStatement.pillar.engineering' as const, icon: HardHat },
  { key: 'oneStatement.pillar.projectDelivery' as const, icon: Settings2 },
  { key: 'oneStatement.pillar.investment' as const, icon: TrendingUp },
  { key: 'oneStatement.pillar.digital' as const, icon: Cpu },
] as const;

/** 03 — EAM in One Statement (after About EAM). */
export default function HomeOneStatementSection() {
  const reveal = useScrollReveal({ threshold: 0.08 });
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-one-statement"
      data-home-section="one-statement"
      className="home-one-statement home-section-block"
      aria-label={t('oneStatement.aria')}
    >
      <div className="home-one-statement__inner mx-auto w-full max-w-[1586px]">
        <div
          ref={reveal.ref}
          className={`home-one-statement__stage home-one-statement__stage--mural ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="home-one-statement__copy" dir={direction}>
            <HomeSectionTopFigure
              editId="home-one-statement-image"
              assetKey="aboutCinematic"
              width={752}
              height={941}
            />
            <div className="home-one-statement__eyebrow">
              <span className="home-one-statement__eyebrow-line" aria-hidden />
              <span className="home-one-statement__eyebrow-text">{t('oneStatement.eyebrow')}</span>
              <span className="home-one-statement__eyebrow-line" aria-hidden />
            </div>
            <h2 className="home-one-statement__title">{t('oneStatement.title')}</h2>
            <p className="home-one-statement__tagline">{t('oneStatement.taglineEn')}</p>
            <blockquote className="home-one-statement__body">
              <p>{t('oneStatement.body')}</p>
            </blockquote>
            <ul className="home-one-statement__pillars">
              {PILLARS.map(({ key, icon: Icon }) => (
                <li key={key} className="home-one-statement__pillar">
                  <span className="home-one-statement__pillar-icon">
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="home-one-statement__pillar-label">{t(key)}</span>
                  <span className="home-one-statement__pillar-dash" aria-hidden />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <HomeSectionBottomFade to="cream" />
    </section>
  );
}
