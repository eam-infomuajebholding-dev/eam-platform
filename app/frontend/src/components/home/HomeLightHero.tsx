import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { HOME_HERO_PROMO_VIDEO_SRC, getHomeImage } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import { ASSISTANT_LAYOUT_EVENT } from '@/features/ai-workspace/assistantShell';

const HERO_LOGO_SRC = '/assets/eam-emblem-transparent.png';
const MIN_PROMO_LETTERBOX_PX = 48;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type HeroPhase = 'promo' | 'static';
type PromoEmblemSlot = 'side' | 'top';

function PromoHeroBrand({ promoSlot }: { promoSlot: PromoEmblemSlot }) {
  const { t } = useLanguage();

  return (
    <div className={`home-hero-promo-brand home-hero-promo-brand--${promoSlot}`}>
      <Link
        to="/services/platforms"
        className="home-hero-promo-brand__emblem-link"
        aria-label={t('home.sectorPlatform.emblemAria')}
        title={t('home.sectorPlatform.emblemHint')}
      >
        <img
          src={HERO_LOGO_SRC}
          alt=""
          aria-hidden
          className="home-hero-emblem-img home-hero-emblem-img--promo z-[2] block"
          loading="eager"
          decoding="async"
        />
      </Link>
      <div className="home-hero-promo-brand__caption">
        <p className="home-hero-promo-brand__line home-hero-promo-brand__line--ar">{t('hero.promoCompanyAr')}</p>
        <p className="home-hero-promo-brand__line home-hero-promo-brand__line--en">{t('hero.promoCompanyEn')}</p>
      </div>
    </div>
  );
}

function HeroEmblemLink() {
  const { t } = useLanguage();

  return (
    <Link
      to="/services/platforms"
      className="home-hero-emblem-link contents"
      aria-label={t('home.sectorPlatform.emblemAria')}
      title={t('home.sectorPlatform.emblemHint')}
    >
      <img
        src={HERO_LOGO_SRC}
        alt=""
        aria-hidden
        className="home-hero-emblem-img absolute right-0 top-0 z-[2] block"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}

/** Hero: brand film first (native controls — sound, fullscreen), then static hero after `ended`. */
export default function HomeLightHero() {
  const hero = getHomeImage('hero');
  const { t } = useLanguage();
  const letterboxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<HeroPhase>(() => (prefersReducedMotion() ? 'static' : 'promo'));
  const [promoEmblemSlot, setPromoEmblemSlot] = useState<PromoEmblemSlot>('side');

  const showStaticHero = useCallback(() => {
    setPhase('static');
  }, []);

  const replayPromo = useCallback(() => {
    setPhase('promo');
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      if (mq.matches) {
        showStaticHero();
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [showStaticHero]);

  useEffect(() => {
    if (phase !== 'promo') {
      return;
    }
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const tryPlay = () => {
      void video.play().catch(() => {
        /* autoplay may be blocked — user can play via controls (with sound / fullscreen) */
      });
    };

    tryPlay();
    video.addEventListener('loadeddata', tryPlay, { once: true });
    window.dispatchEvent(new CustomEvent(ASSISTANT_LAYOUT_EVENT));
    return () => {
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'promo') {
      return;
    }

    const letterbox = letterboxRef.current;
    const wrap = letterbox?.parentElement;
    if (!letterbox || !wrap) {
      return;
    }

    const measure = () => {
      const sideWidth = letterbox.clientWidth;
      setPromoEmblemSlot(sideWidth >= MIN_PROMO_LETTERBOX_PX ? 'side' : 'top');
    };

    measure();
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    observer.observe(letterbox);

    const video = videoRef.current;
    video?.addEventListener('loadedmetadata', measure);

    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
      video?.removeEventListener('loadedmetadata', measure);
    };
  }, [phase]);

  const showPromo = phase === 'promo';

  return (
    <div className="home-hero-block flex h-full min-h-0 flex-1 flex-col">
      <section
        id="home-hero"
        role="region"
        data-home-section="hero"
        data-home-first-screen-end
        className={`home-light-hero relative h-full min-h-0 flex-1 overflow-hidden rounded-[20px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] shadow-[0_4px_24px_rgba(139,77,0,0.08)] ${showPromo ? 'home-light-hero--promo' : ''}`}
        aria-label={t('hero.aria')}
      >
        {showPromo ? (
          <div className="home-hero-cinematic-wrap absolute inset-0 z-[1] overflow-hidden bg-black">
            <div className="home-hero-promo-video-track">
              <video
                ref={videoRef}
                className="home-hero-cinematic"
                controls
                playsInline
                preload="metadata"
                poster={hero.src}
                onEnded={showStaticHero}
                onError={showStaticHero}
              >
                <source src={HOME_HERO_PROMO_VIDEO_SRC} type="video/mp4" />
              </video>
            </div>
            <div ref={letterboxRef} className="home-hero-promo-letterbox">
              {promoEmblemSlot === 'side' ? <PromoHeroBrand promoSlot="side" /> : null}
            </div>
            {promoEmblemSlot === 'top' ? <PromoHeroBrand promoSlot="top" /> : null}
          </div>
        ) : null}

        <div
          className={`home-hero-static-bg absolute inset-0 z-[1] transition-opacity duration-700 ${
            showPromo ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          aria-hidden={showPromo}
        >
          <ResponsiveImage
            asset={hero}
            className="home-hero-bg-img h-full w-full object-cover"
            priority={!showPromo}
            width={1800}
            height={900}
          />
        </div>

        {!showPromo ? <HeroEmblemLink /> : null}

        {!showPromo ? (
          <button
            type="button"
            className="home-hero-replay-promo absolute bottom-3 start-3 z-[3] flex h-8 w-8 items-center justify-center rounded-full border border-[var(--eam-home-gold)]/50 bg-[var(--eam-home-cream-light)]/92 text-[var(--eam-home-gold-deep)] shadow-[0_2px_12px_rgba(139,77,0,0.18)] backdrop-blur-sm transition hover:border-[var(--eam-home-gold)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--eam-home-gold)] sm:bottom-4 sm:start-4"
            onClick={replayPromo}
            aria-label={t('hero.replayPromo')}
            title={t('hero.replayPromo')}
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </button>
        ) : null}
      </section>
    </div>
  );
}
