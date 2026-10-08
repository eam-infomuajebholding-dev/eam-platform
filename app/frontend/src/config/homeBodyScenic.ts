import homeBodyBgRight from '@/assets/images/home/03-home-body-bg-right.jpg';
import homeBodyBgLeft from '@/assets/images/home/04-home-body-bg-left.jpg';

/**
 * Side flanks — fill gutter for `.home-main-body-bg__flank-range` (§02 About → contact).
 * On-screen width = `--home-scenic-gutter-inline-end`; height = flank-range (CSS cover).
 */
export const HOME_BODY_BG_RIGHT_STRIP_SPEC = {
  referenceViewportWidth: 1920,
  stripHeightPx: 6102,
  stripWidthPxAt1920: 640,
  assetWidthPx: 1280,
  assetHeightPx: 12204,
} as const;

/** Intrinsic pixels of bundled flank masters. */
export const homeBodyScenicFlankAssetSize = {
  left: { width: 341, height: 1024 },
  right: { width: 167, height: 1024 },
} as const;

/** @deprecated Use `homeBodyScenicFlankAssetSize.right` — kept for any legacy imports */
export const HOME_BODY_SCENIC_ASSET_WIDTH = homeBodyScenicFlankAssetSize.right.width;
export const HOME_BODY_SCENIC_ASSET_HEIGHT = homeBodyScenicFlankAssetSize.right.height;

export const HOME_BODY_SCENIC_NATURAL_WIDTH = homeBodyScenicFlankAssetSize.left.width;
export const HOME_BODY_SCENIC_NATURAL_HEIGHT = homeBodyScenicFlankAssetSize.left.height;

export const homeBodyScenicFlanks = {
  right: homeBodyBgRight,
  left: homeBodyBgLeft,
};
