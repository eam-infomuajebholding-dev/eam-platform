import HomeSectionImage from '@/components/home/HomeSectionImage';
import type { HomeImageKey } from '@/config/assetKeys';

type Props = {
  editId: string;
  assetKey: HomeImageKey;
  width?: number;
  height?: number;
};

/** Editorial image band above section copy (homepage mural stack). */
export default function HomeSectionTopFigure({
  editId,
  assetKey,
  width = 1600,
  height = 900,
}: Props) {
  return (
    <figure className="home-section-top-figure">
      <HomeSectionImage
        editId={editId}
        assetKey={assetKey}
        className="home-section-top-figure__img"
        loading="lazy"
        width={width}
        height={height}
      />
    </figure>
  );
}
