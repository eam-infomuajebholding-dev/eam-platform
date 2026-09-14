import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Route, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import ServicesSectorCard from '@/components/services/ServicesSectorCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { SECTOR_DEFINITIONS } from '@/data/sectors';
import {
  SERVICE_CATEGORIES,
  filterSectorsByCategory,
  type ServiceCategoryId,
} from '@/data/serviceCategories';

export default function Services() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryId>('all');

  const visibleSectors = useMemo(
    () => filterSectorsByCategory(SECTOR_DEFINITIONS, activeCategory),
    [activeCategory],
  );

  const stats = [
    {
      icon: Layers,
      valueKey: 'page.services.stat.sectorsValue' as const,
      labelKey: 'page.services.stat.sectors' as const,
    },
    {
      icon: Route,
      valueKey: 'page.services.stat.journeysValue' as const,
      labelKey: 'page.services.stat.journeys' as const,
    },
    {
      icon: Sparkles,
      valueKey: 'page.services.stat.platformValue' as const,
      labelKey: 'page.services.stat.platform' as const,
    },
  ];

  return (
    <Layout>
      <PageHero
        titleKey="page.services.hero.title"
        subtitleKey="page.services.hero.subtitle"
        titleEditableId="services-hero-title"
        subtitleEditableId="services-hero-desc"
      />

      <section className="border-b border-soft-border/50 bg-cream-light dark:bg-background">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <p data-editable-id="services-intro" className="text-lead mx-auto max-w-3xl text-center">
            {t('page.services.intro')}
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ icon: Icon, valueKey, labelKey }) => (
              <div
                key={labelKey}
                className="rounded-2xl border border-soft-border/60 bg-cream px-5 py-6 text-center dark:bg-surface"
              >
                <Icon className="mx-auto mb-3 h-6 w-6 text-gold-500" strokeWidth={1.75} />
                <p className="font-display text-3xl font-semibold text-gold-600 dark:text-gold-300">
                  {t(valueKey)}
                </p>
                <p className="text-caption mt-1">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-alt py-12 dark:bg-surface-muted md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="font-display text-display-sm text-ink md:text-display-md">
              {t('page.services.grid.title')}
            </h2>
            <p className="text-body mx-auto mt-3 max-w-2xl">{t('page.services.grid.subtitle')}</p>
          </div>

          <div
            className="mb-10 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label={t('page.services.grid.title')}
          >
            {SERVICE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gold-500 text-white shadow-gold'
                    : 'border border-soft-border/80 bg-cream-light text-ink-secondary hover:border-gold-300 hover:bg-gold-50 dark:bg-surface dark:text-ink-secondary'
                }`}
              >
                {t(category.labelKey)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleSectors.map((sector) => (
              <ServicesSectorCard key={sector.slug} sector={sector} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-soft-border/50 bg-surface-alt py-16 dark:bg-surface-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 data-editable-id="services-cta-title" className="font-display text-display-sm gold-text md:text-display-md">
            {t('page.services.cta.title')}
          </h2>
          <p data-editable-id="services-cta-desc" className="text-lead mx-auto mt-4 max-w-xl">
            {t('page.services.cta.desc')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/consultation" className="eam-btn-primary inline-block px-8 py-3.5 text-base">
              {t('page.services.cta.button')}
            </Link>
            <Link to="/" className="eam-btn-outline inline-block px-8 py-3.5 text-base">
              {t('chat.enterJourney')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
