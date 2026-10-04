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
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        <div className="relative min-h-[200px] overflow-hidden lg:min-h-[220px]">
          <ResponsiveImage asset={hero} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="command-center-hero__overlay absolute inset-0" />
          <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
            <div className="max-w-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-200">
                {t('commandCenter.hero.eyebrow')}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-[1.65rem]">
                {t('commandCenter.title')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/88">{t('commandCenter.hero.subtitle')}</p>
            </div>
            <div className="mt-6 max-w-lg rounded-xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200">
                {t('commandCenter.hero.platformTagline')}
              </p>
              <p className="mt-1 text-xs leading-6 text-white/85">{t('commandCenter.hero.platformTaglineBody')}</p>
            </div>
          </div>
        </div>

        <div className="command-center-hero__aside flex flex-col justify-center gap-4 border-t border-black/[0.06] p-5 sm:p-6 lg:border-t-0 lg:border-s">
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

          <blockquote className="rounded-xl border border-gold/20 bg-gold/[0.07] px-4 py-3">
            <p className="text-xs font-bold text-gold-800 dark:text-gold-200">{t('commandCenter.hero.quoteTitle')}</p>
            <p className="mt-1 text-sm leading-6 text-ink/75 dark:text-white/75">{t('commandCenter.hero.quoteBody')}</p>
          </blockquote>

          {generatedAt ? (
            <p className="text-[11px] text-ink-muted">
              {t('commandCenter.lastUpdated')}: {new Date(generatedAt).toLocaleString(locale)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
