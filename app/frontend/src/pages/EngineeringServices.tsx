import { useMemo } from 'react';

import Layout from '@/components/Layout';

import ImagePageHero from '@/components/page/ImagePageHero';

import PageCtaSection from '@/components/page/PageCtaSection';

import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';

import { useLanguage } from '@/contexts/LanguageContext';

import { engineeringServicesForDetailGrid } from '@/data/engineeringServiceCatalog';



const ENGINEERING_IMAGE =

  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7nlqaagqa/engineering-services-blueprints.png';



export default function EngineeringServices() {

  const { language } = useLanguage();

  const services = useMemo(() => engineeringServicesForDetailGrid(language), [language]);



  return (

    <Layout>

      <ImagePageHero

        titleKey="page.engineering.hero.title"

        subtitleKey="page.engineering.hero.subtitle"

        backgroundImage={ENGINEERING_IMAGE}

        ctaTo="/journeys/engineering-consulting"

        ctaKey="page.sector.startEc"

      />



      <ServiceDetailGrid services={services} titleKey="page.services.engineering.title" />



      <PageCtaSection

        titleKey="page.engineering.cta.title"

        descKey="page.engineering.cta.desc"

        buttonKey="common.contactUs"

        buttonTo="/contact-card"

      />

    </Layout>

  );

}


