import homeBodyBgRight from '@/assets/images/home/03-home-body-bg-right.jpg';

/**
 * Right flank — fills gutter for `.home-main-body-bg__flank-range` (§02 About → contact).
 * On-screen width = `--home-scenic-gutter-inline-end`; height = flank-range (CSS cover).
 */
export const HOME_BODY_BG_RIGHT_STRIP_SPEC = {
  referenceViewportWidth: 1920,
  stripHeightPx: 6102,
  stripWidthPxAt1920: 640,
  assetWidthPx: 1280,
  assetHeightPx: 12204,
} as const;

/** Pixels of the bundled master file (`03-home-body-bg-right.jpg`). */
export const HOME_BODY_SCENIC_ASSET_WIDTH = 167;
export const HOME_BODY_SCENIC_ASSET_HEIGHT = 1024;

export const HOME_BODY_SCENIC_NATURAL_WIDTH = HOME_BODY_SCENIC_ASSET_WIDTH;
export const HOME_BODY_SCENIC_NATURAL_HEIGHT = HOME_BODY_SCENIC_ASSET_HEIGHT;

export const homeBodyScenicFlanks = {
  right: homeBodyBgRight,
  left: null as string | null,
};
