import { Link } from 'react-router-dom';
import { Bell, Mail } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/** Final CTA — routes to real contact; no fake newsletter backend */
export default function HomeContactSection() {
  const reveal = useScrollReveal({ threshold: 0.15 });
  const footerCta = getHomeImage('footerCta');
  const { t } = useLanguage();

  return (
    <section
      id="home-contact"
      data-home-section="contact"
      className="home-contact home-section-block relative overflow-hidden bg-[#1a2634] text-white"
      aria-label={t('homeContact.aria')}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <ResponsiveImage
          asset={{ ...footerCta, alt: '' }}
          className="h-full w-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2634]/95 via-[#1a2634]/70 to-[#1a2634]/50" />
      </div>

      <div className="home-contact__inner container relative mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`mx-auto max-w-2xl text-center ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--eam-home-gold)]/20">
            <Bell className="h-6 w-6 text-[var(--eam-home-gold-soft)]" strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl font-bold text-[var(--eam-home-gold-soft)] md:text-4xl">
            {t('homeContact.title')}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/80 md:text-base">{t('homeContact.body')}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--eam-home-gold)] px-6 py-3 text-sm font-semibold text-[#2B2118] transition hover:bg-[var(--eam-home-gold-soft)]"
            >
              <Mail className="h-4 w-4" />
              {t('homeContact.ctaContact')}
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-[var(--eam-home-gold)] hover:text-[var(--eam-home-gold-soft)]"
            >
              {t('homeContact.ctaAbout')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
