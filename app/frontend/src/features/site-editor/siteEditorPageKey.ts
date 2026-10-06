import { pageKeyForSectionVisibility } from '@/features/section-visibility/registry';

/** Homepage stack routes share one editor + visibility namespace (`/`). */
export function siteEditorPageKey(pathname: string): string {
  return pageKeyForSectionVisibility(pathname);
}

export const HOME_STACK_EDITOR_PAGES = ['/', '/services/platforms'] as const;
