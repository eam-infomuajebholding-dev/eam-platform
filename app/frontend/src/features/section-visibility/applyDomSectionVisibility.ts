import type { SectionPublishState } from './registry';

/**
 * Fallback for sections not wrapped in ManagedSection: hide via DOM on public view.
 */
export function applyDomSectionVisibility(
  visibility: Record<string, SectionPublishState>,
  editorPreview: boolean,
) {
  for (const el of document.querySelectorAll('[data-home-section]')) {
    const id = el.getAttribute('data-home-section');
    if (!id) continue;
    const state = visibility[id] ?? 'published';
    const htmlEl = el as HTMLElement;
    if (state === 'hidden' && !editorPreview) {
      htmlEl.style.display = 'none';
      htmlEl.setAttribute('data-section-suppressed', 'true');
    } else {
      if (htmlEl.getAttribute('data-section-suppressed') === 'true') {
        htmlEl.style.display = '';
        htmlEl.removeAttribute('data-section-suppressed');
      }
    }
  }
}
