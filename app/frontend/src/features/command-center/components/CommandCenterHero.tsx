import { Sun } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type CommandCenterHeroProps = {
  generatedAt?: string | null;
};

export default function CommandCenterHero({ generatedAt }: CommandCenterHeroProps) {
  const hero = getHomeImage('hero');
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const greeting =
    user?.name != null && user.name.length > 0
      ? t('commandCenter.hero.greetingNamed').replace('{name}', user.name.split(' ')[0] ?? user.name)
      : t('commandCenter.hero.greeting');

  return (
    <section className="command-center-hero overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="command-center-hero__grid">
        <div className="command-center-hero__intro">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-600">
            {t('commandCenter.hero.eyebrow')}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t('commandCenter.title')}
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink/70">{t('commandCenter.hero.subtitle')}</p>
        </div>

        <div className="command-center-hero__visual relative min-h-[200px] overflow-hidden">
          <ResponsiveImage asset={hero} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="command-center-hero__visual-scrim absolute inset-0" />
        </div>

        <div className="command-center-hero__tagline">
          <p className="text-lg font-bold leading-8 text-ink sm:text-xl">{t('commandCenter.hero.platformTagline')}</p>
          <p className="mt-2 text-xs leading-6 text-ink/60">{t('commandCenter.hero.platformTaglineBody')}</p>
        </div>

        <div className="command-center-hero__widget">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink dark:text-white">{today}</p>
              <p className="mt-2 text-sm leading-6 text-ink/80 dark:text-white/85">{greeting}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#f4f6f8] px-3 py-2 dark:bg-white/8">
              <Sun className="h-5 w-5 text-amber-500" aria-hidden />
              <span className="text-sm font-bold text-ink dark:text-white">{t('commandCenter.hero.weather')}</span>
            </div>
          </div>

          <blockquote className="mt-4 rounded-xl border border-gold/20 bg-gold/[0.07] px-4 py-3">
            <p className="text-xs font-bold text-gold-800 dark:text-gold-200">{t('commandCenter.hero.quoteTitle')}</p>
            <p className="mt-1 text-sm leading-6 text-ink/75 dark:text-white/75">{t('commandCenter.hero.quoteBody')}</p>
          </blockquote>

          {generatedAt ? (
            <p className="mt-3 text-[11px] text-ink-muted">
              {t('commandCenter.lastUpdated')}: {new Date(generatedAt).toLocaleString(locale)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
