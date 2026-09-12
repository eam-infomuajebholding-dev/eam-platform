import HomeLightHero from '@/components/home/HomeLightHero';
import HomeStatsRibbon from '@/components/home/HomeStatsRibbon';
import SectorPlatformStrip from '@/components/home/SectorPlatformStrip';
import { WorkspaceProvider } from '@/features/ai-workspace/WorkspaceContext';

/** Section 01 — approved light homepage first viewport */
export default function HomeFirstViewport() {
  return (
    <section
      id="home-command-center"
      data-home-section="first-viewport"
      aria-label="واجهة EAM الرئيسية"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1586px] px-3 pb-4 pt-2 sm:px-4 lg:px-[16px]">
        <WorkspaceProvider>
          <HomeLightHero />
          <HomeStatsRibbon />
          <SectorPlatformStrip />
        </WorkspaceProvider>
      </div>
    </section>
  );
}
