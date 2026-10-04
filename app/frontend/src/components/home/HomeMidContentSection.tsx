import { BarChart3, Boxes, Globe2, Route, TreePine, type LucideIcon } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
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

/** 05 — Why EAM / The EAM difference (content on fixed bg field). */
export default function HomeMidContentSection() {
  const introReveal = useScrollReveal({ threshold: 0.12 });
  const pillarsReveal = useScrollReveal({ threshold: 0.06 });
  const midBg = getHomeImage('midContentBg');
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-mid-content"
      data-home-section="mid-content"
      className="home-mid-content home-section-block home-section-block--showcase relative overflow-hidden"
      aria-label={t('midContent.aria')}
    >
      <div className="home-mid-content__bg" aria-hidden="true">
        <ResponsiveImage
          asset={midBg}
          className="home-mid-content__bg-img"
          loading="lazy"
          width={1586}
          height={900}
        />
      </div>

      <div className="home-mid-content__shell">
        <div className="home-mid-content__layout">
          <div className="home-mid-content__visual-slot" aria-hidden="true" />

          <div className="home-mid-content__content" dir={direction}>
            <header
              ref={introReveal.ref}
              className={`home-mid-content__header ${introReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
            >
              <div className="home-mid-content__headline">
                <h2 className="home-mid-content__title">{t('midContent.title')}</h2>
                <p className="home-mid-content__tagline" lang="en">
                  {t('midContent.taglineEn')}
                </p>
              </div>

              <div className="home-mid-content__meta">
                <div className="home-mid-content__section-meta">
                  <span className="home-mid-content__section-rule home-mid-content__section-rule--long" aria-hidden />
                  <span className="home-mid-content__section-id">
                    <span className="home-mid-content__section-mark" aria-hidden>
                      —
                    </span>
                    <span className="home-mid-content__section-num">{t('midContent.number')}</span>
                  </span>
                  <span className="home-mid-content__section-rule home-mid-content__section-rule--short" aria-hidden />
                </div>
                <p className="home-mid-content__eyebrow" lang="en">
                  {t('midContent.eyebrow')}
                </p>
                <p className="home-mid-content__meta-line">{t('midContent.metaAr')}</p>
                <p className="home-mid-content__meta-line home-mid-content__meta-line--en" lang="en">
                  {t('midContent.metaEn')}
                </p>
              </div>
            </header>

            <div
              ref={pillarsReveal.ref}
              className={`home-mid-content__pillars ${pillarsReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
            >
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article key={pillar.num} className="home-mid-content__pillar">
                    <div className="home-mid-content__pillar-frame">
                      <span className="home-mid-content__pillar-num">{pillar.num}</span>
                      <div className="home-mid-content__pillar-icon-wrap">
                        <Icon className="home-mid-content__pillar-icon" strokeWidth={1.35} aria-hidden />
                      </div>
                      <h3 className="home-mid-content__pillar-title">{t(pillar.titleKey)}</h3>
                      <p className="home-mid-content__pillar-desc">{t(pillar.descKey)}</p>
                      <p className="home-mid-content__pillar-title-en" lang="en">
                        {t(pillar.titleEnKey)}
                      </p>
                      <p className="home-mid-content__pillar-desc-en" lang="en">
                        {t(pillar.descEnKey)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <HomeSectionBottomFade to="cream" />
    </section>
  );
}
