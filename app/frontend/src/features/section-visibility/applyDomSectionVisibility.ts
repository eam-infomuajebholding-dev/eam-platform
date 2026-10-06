import type { SectionPublishState } from './registry';
import { sectionsForPage, pageKeyForSectionVisibility } from './registry';
import { readSectionIdFromElement, SECTION_DOM_SELECTOR } from './sectionDom';

function effectiveState(
  sectionId: string,
  visibility: Record<string, SectionPublishState>,
  pageKey: string,
): SectionPublishState {
  if (visibility[sectionId]) return visibility[sectionId];
  const def = sectionsForPage(pageKey).find((s) => s.id === sectionId);
  return def?.defaultState ?? 'published';
}

/** Applies visibility to `[data-page-section]` / `[data-home-section]` roots. */
export function applyDomSectionVisibility(
  pagePathname: string,
  visibility: Record<string, SectionPublishState>,
  editorPreview: boolean,
) {
  const pageKey = pageKeyForSectionVisibility(pagePathname);

  for (const el of document.querySelectorAll(SECTION_DOM_SELECTOR)) {
    const id = readSectionIdFromElement(el);
    if (!id) continue;
    const state = effectiveState(id, visibility, pageKey);
    const htmlEl = el as HTMLElement;
    if (state === 'hidden' && !editorPreview) {
      htmlEl.style.display = 'none';
      htmlEl.setAttribute('data-section-suppressed', 'true');
    } else if (htmlEl.getAttribute('data-section-suppressed') === 'true') {
      htmlEl.style.display = '';
      htmlEl.removeAttribute('data-section-suppressed');
    }
  }
}
