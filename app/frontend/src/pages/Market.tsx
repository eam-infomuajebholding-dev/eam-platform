import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import PageSection from '@/components/page/PageSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Clock, ShoppingBag, Sparkles } from 'lucide-react';

export default function Market() {
  const { t } = useLanguage();

  return (
    <Layout>
      <PageHero titleKey="page.market.hero.title" subtitleKey="page.market.hero.subtitle" />

      <PageSection variant="cream" withGlow>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-soft-border/70 bg-cream p-10 text-center shadow-gold-card dark:bg-surface md:p-14">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gold-50 dark:bg-gold/10">
              <ShoppingBag className="h-12 w-12 text-gold-600 dark:text-gold-400" />
            </div>
            <p className="text-label mb-4 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t('common.comingSoon')}
            </p>
            <h2 className="gold-text mb-6 font-display text-display-sm md:text-display-md">
              {t('page.market.comingSoon')}
            </h2>
            <p className="text-lead mb-8">{t('page.market.body')}</p>
            <div className="mb-8 flex items-center justify-center gap-2 text-sm text-gold-600 dark:text-gold-400">
              <Clock className="h-4 w-4" />
              <span>{t('page.market.launchNote')}</span>
            </div>
            <Link
              to="/contact"
              className="eam-btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('common.contactUs')}
            </Link>
          </div>
        </div>
      </PageSection>
    </Layout>
  );
}
