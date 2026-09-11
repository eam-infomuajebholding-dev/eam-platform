import HomeQuickActionBar from '@/components/home/HomeQuickActionBar';
import QuickActions from '@/components/home/QuickActions';
import HomeHeroCenter from '@/components/home/HomeHeroCenter';
import LatestProjectsCard from '@/components/home/LatestProjectsCard';
import FeaturedProjectsCarousel from '@/components/home/FeaturedProjectsCarousel';
import PlatformStatisticsCard from '@/components/home/PlatformStatisticsCard';
import RecentActivityCard from '@/components/home/RecentActivityCard';
import SectorPlatformStrip from '@/components/home/SectorPlatformStrip';
import HomepageOrnaments from '@/components/home/HomepageOrnaments';
import { WorkspaceProvider, useWorkspace } from '@/features/ai-workspace/WorkspaceContext';
import { BUILD_VILLA_QUICK_ACTION_LABEL } from '@/features/ai-workspace/types';

function HomepageWorkspace() {
  const { startBuildVillaFromQuickAction } = useWorkspace();

  return (
    <>
      <HomeQuickActionBar>
        <QuickActions
          onSelect={(label) => {
            if (label === BUILD_VILLA_QUICK_ACTION_LABEL) {
              void startBuildVillaFromQuickAction();
            }
          }}
        />
      </HomeQuickActionBar>

      <div className="homepage-dashboard relative mt-1 grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,27fr)_minmax(0,42fr)_minmax(0,27fr)] lg:gap-[8px] lg:h-[626px] lg:items-stretch">
        <aside
          data-home-column="right"
          className="order-2 flex min-w-0 flex-col gap-1.5 lg:order-1 lg:min-h-0"
        >
          <PlatformStatisticsCard />
          <RecentActivityCard />
        </aside>

        <main data-home-column="center" className="order-1 min-h-0 min-w-0 lg:order-2">
          <HomeHeroCenter />
        </main>

        <aside
          data-home-column="left"
          className="order-3 flex min-w-0 flex-col gap-1.5 lg:min-h-0"
        >
          <LatestProjectsCard />
          <FeaturedProjectsCarousel />
        </aside>
      </div>

      <SectorPlatformStrip />
    </>
  );
}

/** Section 01 — approved EAM Command Center first viewport (geometry locked) */
export default function HomeFirstViewport() {
  return (
    <section id="home-command-center" data-home-section="command-center" aria-label="مركز قيادة EAM">
      <HomepageOrnaments />
      <div className="relative z-10 mx-auto w-full max-w-[1586px] px-3 pb-[18px] pt-2 sm:px-4 lg:px-[16px]">
        <WorkspaceProvider>
          <HomepageWorkspace />
        </WorkspaceProvider>
      </div>
    </section>
  );
}
