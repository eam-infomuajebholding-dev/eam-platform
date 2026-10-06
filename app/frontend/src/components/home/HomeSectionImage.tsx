import ResponsiveImage from '@/components/ui/ResponsiveImage';
import type { HomeImageKey } from '@/config/assetKeys';
import { getHomeImage } from '@/config/assets';

type Props = {
  /** Stable id for site editor + restore default */
  editId: string;
  assetKey: HomeImageKey;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
};

export default function HomeSectionImage({
  editId,
  assetKey,
  className,
  loading = 'lazy',
  width,
  height,
}: Props) {
  const asset = getHomeImage(assetKey);

  return (
    <ResponsiveImage
      asset={asset}
      className={className}
      loading={loading}
      width={width}
      height={height}
      data-editable-id={editId}
      data-editor-default-src={asset.src}
    />
  );
}
