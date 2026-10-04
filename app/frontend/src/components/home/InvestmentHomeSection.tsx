import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import HomeSectionBottomFade from '@/components/home/HomeSectionBottomFade';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/** Homepage investment promotion — not operational Investment journey (#03) */
export default function InvestmentHomeSection() {
  const reveal = useScrollReveal({ threshold: 0.12 });
  const banner = getHomeImage('investmentBanner');
  const { t, direction } = useLanguage();

  return (
    <section
      id="home-investment"
      data-home-section="investment"
      className="home-section-block relative overflow-hidden bg-[#1a2634] text-white"
      aria-label={t('invest.aria')}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <ResponsiveImage
          asset={{ ...banner, alt: '' }}
          className="h-full w-full object-cover opacity-50"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#1a2634]/95 via-[#1a2634]/75 to-[#1a2634]/55" />
      </div>

      <div className="container relative mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`mx-auto max-w-3xl text-center ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--eam-home-gold)]/20">
            <TrendingUp className="h-6 w-6 text-[var(--eam-home-gold-soft)]" strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl font-bold text-[var(--eam-home-gold-soft)] md:text-4xl">
            {t('invest.title')}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/80 md:text-base">{t('invest.body')}</p>
          <Link
            to="/invest"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--eam-home-gold)] px-6 py-3 text-sm font-semibold text-[#2B2118] transition hover:bg-[var(--eam-home-gold-soft)]"
          >
            {t('invest.cta')}
            <ArrowLeft className={`h-4 w-4 ${direction === 'ltr' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </section>
  );
}
