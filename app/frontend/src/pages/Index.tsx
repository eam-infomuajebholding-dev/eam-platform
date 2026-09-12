import Layout from '@/components/Layout';
import HomeFirstViewport from '@/components/home/HomeFirstViewport';
import AboutEAMSection from '@/components/home/AboutEAMSection';
import HomePlatformsGridSection from '@/components/home/HomePlatformsGridSection';
import ProjectsShowcaseSection from '@/components/home/ProjectsShowcaseSection';
import InvestmentHomeSection from '@/components/home/InvestmentHomeSection';
import HomeContactSection from '@/components/home/HomeContactSection';

export default function Index() {
  return (
    <Layout>
      <div className="eam-home relative overflow-x-hidden">
        <HomeFirstViewport />
        <AboutEAMSection />
        <HomePlatformsGridSection />
        <ProjectsShowcaseSection />
        <InvestmentHomeSection />
        <HomeContactSection />
      </div>
    </Layout>
  );
}
