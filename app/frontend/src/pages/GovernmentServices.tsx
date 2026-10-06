import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { governmentServicesForDetailGrid } from '@/data/governmentServiceCatalog';
import { useMemo } from 'react';

const GOVERNMENT_IMAGE =
  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7mxiaagpq/government-services-documents.png';

export default function GovernmentServices() {
  const { language } = useLanguage();
  const services = useMemo(() => governmentServicesForDetailGrid(language), [language]);

  return (
    <Layout>
      <ImagePageHero
        titleKey="page.government.hero.title"
        subtitleKey="page.government.hero.subtitle"
        backgroundImage={GOVERNMENT_IMAGE}
        titleEditableId="government-hero-title"
        subtitleEditableId="government-hero-subtitle"
        backgroundEditableId="government-hero-bg"
      />

      <ServiceDetailGrid services={services} titleKey="page.services.government.title" />

      <PageCtaSection
        titleKey="page.government.cta.title"
        descKey="page.government.cta.desc"
        buttonKey="page.sector.startGs"
        buttonTo="/journeys/government-services"
      />
    </Layout>
  );
}
