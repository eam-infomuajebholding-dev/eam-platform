import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Cloud,
  HardHat,
  Layers,
  Leaf,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HomeMessageKey } from '@/i18n/homeMessages';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import HomeSectionTopFigure from '@/components/home/HomeSectionTopFigure';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const OFFER_CARDS: Array<{
  id: string;
  num: string;
  icon: typeof Building2;
  titleKey: HomeMessageKey;
  titleEnKey: HomeMessageKey;
  descKey: HomeMessageKey;
  href: string;
}> = [
  {
    id: 'engineering',
    num: '01',
    icon: Building2,
    titleKey: 'offer.card.engineering.title',
    titleEnKey: 'offer.card.engineering.titleEn',
    descKey: 'offer.card.engineering.desc',
    href: '/engineering-services',
  },
  {
    id: 'delivery',
    num: '02',
    icon: HardHat,
    titleKey: 'offer.card.projectDelivery.title',
    titleEnKey: 'offer.card.projectDelivery.titleEn',
    descKey: 'offer.card.projectDelivery.desc',
    href: '/services/contracting',
  },
  {
    id: 'investment',
    num: '03',
    icon: TrendingUp,
    titleKey: 'offer.card.investment.title',
    titleEnKey: 'offer.card.investment.titleEn',
    descKey: 'offer.card.investment.desc',
    href: '/invest',
  },
  {
    id: 'digital',
    num: '04',
    icon: Cloud,
    titleKey: 'offer.card.digital.title',
    titleEnKey: 'offer.card.digital.titleEn',
    descKey: 'offer.card.digital.desc',
    href: '/services/platforms',
  },
];

const OFFER_VALUES: Array<{ icon: typeof BarChart3; labelKey: HomeMessageKey }> = [
  { icon: Target, labelKey: 'offer.value.clarity' },
  { icon: Layers, labelKey: 'offer.value.integration' },
  { icon: Leaf, labelKey: 'offer.value.sustainability' },
  { icon: BarChart3, labelKey: 'offer.value.longTerm' },
];

/** 04 — What we offer (split layout — matches About / One Statement). */
export default function HomeWhatWeOfferSection() {
  const reveal = useScrollReveal({ threshold: 0.1 });
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-what-we-offer"
      data-home-section="what-we-offer"
      className="home-what-we-offer home-section-block"
      aria-label={t('offer.aria')}
    >
      <div className="home-what-we-offer__inner mx-auto w-full max-w-[1586px] px-3 sm:px-4 lg:px-[16px]">
        <div
          ref={reveal.ref}
          className={`home-what-we-offer__stage home-what-we-offer__stage--mural home-mural-stage--wide ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="home-what-we-offer__copy" dir={direction}>
            <HomeSectionTopFigure editId="home-what-we-offer-image" assetKey="aboutCinematic" />
            <div className="home-what-we-offer__eyebrow">
              <span className="home-what-we-offer__eyebrow-line" aria-hidden />
              <span className="home-what-we-offer__eyebrow-text">{t('offer.eyebrow')}</span>
              <span className="home-what-we-offer__eyebrow-line" aria-hidden />
            </div>
            <h2 className="home-what-we-offer__title">{t('offer.title')}</h2>
            <p className="home-what-we-offer__tagline" lang="en">
              {t('offer.taglineEn')}
            </p>
            <blockquote className="home-what-we-offer__body">
              <p>{t('offer.body')}</p>
              <p className="home-what-we-offer__lead" lang="en">
                {t('offer.leadEn')}
              </p>
            </blockquote>

            <div className="home-what-we-offer__cards">
              {OFFER_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.id}
                    to={card.href}
                    dir={direction}
                    className="home-what-we-offer__card group"
                  >
                    <span className="home-what-we-offer__card-num">{card.num}</span>
                    <span className="home-what-we-offer__card-icon" aria-hidden>
                      <Icon strokeWidth={1.25} aria-hidden />
                    </span>
                    <h3 className="home-what-we-offer__card-title">{t(card.titleKey)}</h3>
                    <p className="home-what-we-offer__card-title-en" lang="en">
                      {t(card.titleEnKey)}
                    </p>
                    <p className="home-what-we-offer__card-desc">{t(card.descKey)}</p>
                    <span className="home-what-we-offer__card-arrow" aria-hidden>
                      <ArrowLeft
                        className={`h-4 w-4 ${direction === 'ltr' ? 'rotate-180' : ''}`}
                        strokeWidth={2}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>

            <footer className="home-what-we-offer__values" aria-label={t('offer.aria')}>
              {OFFER_VALUES.map(({ icon: Icon, labelKey }, index) => (
                <div key={labelKey} className="home-what-we-offer__value">
                  {index > 0 ? (
                    <span className="home-what-we-offer__value-divider" aria-hidden />
                  ) : null}
                  <Icon className="home-what-we-offer__value-icon" strokeWidth={1.5} aria-hidden />
                  <span className="home-what-we-offer__value-label">{t(labelKey)}</span>
                </div>
              ))}
            </footer>
          </div>
        </div>
      </div>
      <HomeSectionBottomFade to="cream" />
    </section>
  );
}
