import { useMemo } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
import ServicesUnifiedPlatformEmblem from '@/components/services/ServicesUnifiedPlatformEmblem';
import { useLanguage } from '@/contexts/LanguageContext';
import { engineeringServicesForDetailGrid } from '@/data/engineeringServiceCatalog';
import { governmentServicesForDetailGrid } from '@/data/governmentServiceCatalog';

export default function Services() {
  const { t, language } = useLanguage();
  const location = useLocation();

  const engineeringServices = useMemo(
    () => engineeringServicesForDetailGrid(language),
    [language],
  );
  const governmentServices = useMemo(
    () => governmentServicesForDetailGrid(language),
    [language],
  );

  if (location.hash === '#services-sector-platforms') {
    return <Navigate to="/services/platforms" replace />;
  }

  return (
    <Layout>
      <PageHero
        titleKey="page.services.hero.title"
        subtitleKey="page.services.hero.subtitle"
        titleEditableId="services-hero-title"
        subtitleEditableId="services-hero-desc"
      />

      <section
        className="border-b border-soft-border/50 bg-cream-light dark:bg-background"
        data-page-section="platforms-intro"
        data-section-label="منصة القطاعات — مقدمة"
      >
        <div className="container mx-auto px-4 py-10 md:py-14">
          <ServicesUnifiedPlatformEmblem />

          <p
            data-editable-id="services-intro"
            className="text-lead mx-auto mt-8 max-w-3xl text-center md:mt-10"
          >
            {t('page.services.intro')}
          </p>
          <p className="text-caption mx-auto mt-3 max-w-2xl text-center">{t('page.services.platformGate')}</p>
        </div>
      </section>

      <ServiceDetailGrid
        services={engineeringServices}
        titleKey="page.services.engineering.title"
        subtitleKey="page.services.engineering.subtitle"
        sectionId="engineering"
        sectionLabel="خدمات الهندسة"
      />
      <div className="bg-surface-alt pb-10 text-center dark:bg-surface-muted md:pb-12">
        <Link to="/engineering-services" className="eam-btn-outline inline-block px-8 py-3 text-base">
          {t('page.services.engineering.viewAll')}
        </Link>
      </div>

      <ServiceDetailGrid
        services={governmentServices}
        titleKey="page.services.government.title"
        subtitleKey="page.services.government.subtitle"
        sectionId="government"
        sectionLabel="الخدمات الحكومية"
      />
      <div className="bg-surface-alt pb-14 text-center dark:bg-surface-muted md:pb-16">
        <Link to="/government-services" className="eam-btn-outline inline-block px-8 py-3 text-base">
          {t('page.services.government.viewAll')}
        </Link>
      </div>

      <section
        className="border-t border-soft-border/50 bg-surface-alt py-16 dark:bg-surface-muted"
        data-page-section="cta"
        data-section-label="دعوة للإجراء"
      >
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
