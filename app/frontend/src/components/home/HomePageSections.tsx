import type { ReactNode } from 'react';
import { homeBodyScenicFlankAssetSize, homeBodyScenicFlanks } from '@/config/homeBodyScenic';
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

function HomeBodyScenicFlank({
  src,
  editId,
  width,
  height,
}: {
  src: string | null;
  editId: string;
  width: number;
  height: number;
}) {
  if (!src) return null;

  return (
    <div className="home-main-body-bg__right-wrap" aria-hidden>
      <img
        className="home-main-body-bg__right"
        src={src}
        alt=""
        decoding="async"
        loading="lazy"
        width={width}
        height={height}
        data-editable-id={editId}
        data-editor-default-src={src}
      />
    </div>
  );
}

/** Shared homepage stack — site root and sector platforms hub. */
export default function HomePageSections({ afterWhatWeOffer }: Props) {
  const { right } = homeBodyScenicFlanks;

  return (
    <>
      <div className="home-hero-statement-bridge">
        <HomeFirstViewport />
      </div>
      <div
        className="home-main-body-bg home-main-body-bg--scenic"
        data-scenic-flank-right={right ? '1' : '0'}
      >
        {/* §02→contact: flank height stops before site footer (Layout Footer) */}
        <div className="home-main-body-bg__flank-range">
          <HomeBodyScenicFlank
            src={right}
            editId="home-body-bg-right"
            width={homeBodyScenicFlankAssetSize.right.width}
            height={homeBodyScenicFlankAssetSize.right.height}
          />
          <AboutEAMSection />
          <HomeOneStatementSection />
          <HomeWhatWeOfferSection />
          {afterWhatWeOffer}
          <HomeMidContentSection />
          <ProjectsShowcaseSection />
          <InvestmentHomeSection />
          <HomeContactSection />
        </div>
      </div>
    </>
  );
}
