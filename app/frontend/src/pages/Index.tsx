import Layout from '@/components/Layout';
import HomePageSections from '@/components/home/HomePageSections';

export default function Index() {
  return (
    <Layout>
      <div className="eam-home relative overflow-x-hidden">
        <HomePageSections />
      </div>
    </Layout>
  );
}
