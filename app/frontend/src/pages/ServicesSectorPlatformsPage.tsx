import Layout from '@/components/Layout';
import HomePageSections from '@/components/home/HomePageSections';
import HomeSectorPlatformsSection from '@/components/home/HomeSectorPlatformsSection';

export default function ServicesSectorPlatformsPage() {
  return (
    <Layout>
      <div className="eam-home relative overflow-x-hidden">
        <HomePageSections afterWhatWeOffer={<HomeSectorPlatformsSection />} />
      </div>
    </Layout>
  );
}
