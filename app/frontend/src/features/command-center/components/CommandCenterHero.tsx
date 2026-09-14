import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type CommandCenterHeroProps = {
  generatedAt?: string | null;
};

export default function CommandCenterHero({ generatedAt }: CommandCenterHeroProps) {
  const hero = getHomeImage('aboutCinematic');
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="grid lg:grid-cols-[1.4fr_0.8fr]">
        <div className="relative min-h-[180px] overflow-hidden">
          <ResponsiveImage asset={hero} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#1a2634]/88 via-[#1a2634]/55 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-200">{t('commandCenter.hero.eyebrow')}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t('commandCenter.title')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/80">{t('commandCenter.hero.subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 border-t border-black/5 p-6 dark:border-white/10 lg:border-t-0 lg:border-s lg:border-black/5">
          <div>
            <p className="text-xs text-ink-muted">{today}</p>
            <p className="mt-1 text-sm font-medium text-ink dark:text-white">
              {user?.name
                ? t('commandCenter.hero.greetingNamed').replace('{name}', user.name)
                : t('commandCenter.hero.greeting')}
            </p>
          </div>
          {generatedAt ? (
            <p className="text-xs text-ink-muted">
              {t('commandCenter.lastUpdated')}: {new Date(generatedAt).toLocaleString(locale)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
