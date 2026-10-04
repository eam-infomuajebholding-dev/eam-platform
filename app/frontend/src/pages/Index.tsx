import Layout from '@/components/Layout';
import HomeFirstViewport from '@/components/home/HomeFirstViewport';
import AboutEAMSection from '@/components/home/AboutEAMSection';
import HomeOneStatementSection from '@/components/home/HomeOneStatementSection';
import HomeWhatWeOfferSection from '@/components/home/HomeWhatWeOfferSection';
import HomeMidContentSection from '@/components/home/HomeMidContentSection';
import ProjectsShowcaseSection from '@/components/home/ProjectsShowcaseSection';
import InvestmentHomeSection from '@/components/home/InvestmentHomeSection';
import HomeContactSection from '@/components/home/HomeContactSection';

export default function Index() {
  return (
    <Layout>
      <div className="eam-home relative overflow-x-hidden">
        <div className="home-hero-statement-bridge">
          <HomeFirstViewport />
          <AboutEAMSection />
        </div>
        <HomeOneStatementSection />
        <HomeWhatWeOfferSection />
        <HomeMidContentSection />
        <ProjectsShowcaseSection />
        <InvestmentHomeSection />
        <HomeContactSection />
      </div>
    </Layout>
  );
}
