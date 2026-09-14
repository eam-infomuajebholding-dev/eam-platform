import QuickActions from '@/components/home/QuickActions';
import { useLanguage } from '@/contexts/LanguageContext';

/** Suggested paths rail — below the hero inside the rails panel */
export default function HomeQuickActionsStrip() {
  const { t } = useLanguage();

  return (
    <section className="home-quick-actions-rail w-full overflow-hidden" aria-label={t('quickActions.aria')}>
      <div className="home-rail-header">
        <h2>{t('quickActions.title')}</h2>
        <p>{t('quickActions.subtitle')}</p>
      </div>
      <QuickActions />
    </section>
  );
}
