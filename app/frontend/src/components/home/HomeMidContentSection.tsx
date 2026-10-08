import { BarChart3, Boxes, Globe2, Route, TreePine, type LucideIcon } from 'lucide-react';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import HomeSectionTopFigure from '@/components/home/HomeSectionTopFigure';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HomeMessageKey } from '@/i18n/homeMessages';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PILLARS: Array<{
  num: string;
  icon: LucideIcon;
  titleKey: HomeMessageKey;
  titleEnKey: HomeMessageKey;
  descKey: HomeMessageKey;
  descEnKey: HomeMessageKey;
}> = [
  {
    num: '01',
    icon: Globe2,
    titleKey: 'midContent.pillar1.title',
    titleEnKey: 'midContent.pillar1.titleEn',
    descKey: 'midContent.pillar1.desc',
    descEnKey: 'midContent.pillar1.descEn',
  },
  {
    num: '02',
    icon: BarChart3,
    titleKey: 'midContent.pillar2.title',
    titleEnKey: 'midContent.pillar2.titleEn',
    descKey: 'midContent.pillar2.desc',
    descEnKey: 'midContent.pillar2.descEn',
  },
  {
    num: '03',
    icon: Boxes,
    titleKey: 'midContent.pillar3.title',
    titleEnKey: 'midContent.pillar3.titleEn',
    descKey: 'midContent.pillar3.desc',
    descEnKey: 'midContent.pillar3.descEn',
  },
  {
    num: '04',
    icon: Route,
    titleKey: 'midContent.pillar4.title',
    titleEnKey: 'midContent.pillar4.titleEn',
    descKey: 'midContent.pillar4.desc',
    descEnKey: 'midContent.pillar4.descEn',
  },
  {
    num: '05',
    icon: TreePine,
    titleKey: 'midContent.pillar5.title',
    titleEnKey: 'midContent.pillar5.titleEn',
    descKey: 'midContent.pillar5.desc',
    descEnKey: 'midContent.pillar5.descEn',
  },
];

/** 05 — Why EAM (split layout — matches About / One Statement). */
export default function HomeMidContentSection() {
  const reveal = useScrollReveal({ threshold: 0.08 });
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-mid-content"
      data-home-section="mid-content"
      className="home-mid-content home-section-block"
      aria-label={t('midContent.aria')}
    >
      <div className="home-mid-content__inner mx-auto w-full max-w-[1586px] px-3 sm:px-4 lg:px-[16px]">
        <div
          ref={reveal.ref}
          className={`home-mid-content__stage home-mid-content__stage--mural ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="home-mid-content__copy" dir={direction}>
            <HomeSectionTopFigure editId="home-mid-content-image" assetKey="aboutEam" />
            <div className="home-mid-content__eyebrow">
              <span className="home-mid-content__eyebrow-line" aria-hidden />
              <span className="home-mid-content__eyebrow-text">{t('midContent.eyebrow')}</span>
              <span className="home-mid-content__eyebrow-line" aria-hidden />
            </div>
            <h2 className="home-mid-content__title">{t('midContent.title')}</h2>
            <p className="home-mid-content__tagline" lang="en">
              {t('midContent.taglineEn')}
            </p>
            <blockquote className="home-mid-content__body">
              <p>{t('midContent.metaAr')}</p>
              <p lang="en">{t('midContent.metaEn')}</p>
            </blockquote>

            <ul className="home-mid-content__pillars">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <li key={pillar.num} className="home-mid-content__pillar">
                    <span className="home-mid-content__pillar-icon">
                      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="home-mid-content__pillar-label">{t(pillar.titleKey)}</span>
                    <span className="home-mid-content__pillar-dash" aria-hidden />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <HomeSectionBottomFade to="cream-light" />
    </section>
  );
}
