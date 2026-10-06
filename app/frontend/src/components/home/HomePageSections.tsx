import type { ReactNode } from 'react';
import HomeFirstViewport from '@/components/home/HomeFirstViewport';
import AboutEAMSection from '@/components/home/AboutEAMSection';
import HomeOneStatementSection from '@/components/home/HomeOneStatementSection';
import HomeWhatWeOfferSection from '@/components/home/HomeWhatWeOfferSection';
import HomeMidContentSection from '@/components/home/HomeMidContentSection';
import ProjectsShowcaseSection from '@/components/home/ProjectsShowcaseSection';
import InvestmentHomeSection from '@/components/home/InvestmentHomeSection';
import HomeContactSection from '@/components/home/HomeContactSection';

type Props = {
  /** Optional block after «ماذا نقدّم» (e.g. sector platforms catalog). */
  afterWhatWeOffer?: ReactNode;
};

/** Shared homepage stack — site root and sector platforms hub. */
export default function HomePageSections({ afterWhatWeOffer }: Props) {
  return (
    <>
      <div className="home-hero-statement-bridge">
        <HomeFirstViewport />
        <AboutEAMSection />
      </div>
      <HomeOneStatementSection />
      <HomeWhatWeOfferSection />
      {afterWhatWeOffer}
      <HomeMidContentSection />
      <ProjectsShowcaseSection />
      <InvestmentHomeSection />
      <HomeContactSection />
    </>
  );
}
