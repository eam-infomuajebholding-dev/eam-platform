import type { PageSectionDefinition } from './registry';

export const SECTION_DOM_SELECTOR = '[data-page-section], [data-home-section]';

export function readSectionIdFromElement(el: Element): string | null {
  return el.getAttribute('data-page-section') || el.getAttribute('data-home-section');
}

export function pageSectionAttributes(
  sectionId: string,
  sectionLabel?: string,
): Record<string, string> {
  const attrs: Record<string, string> = { 'data-page-section': sectionId };
  if (sectionLabel) {
    attrs['data-section-label'] = sectionLabel;
  }
  return attrs;
}

/** Sections present in the DOM on the current route. */
export function discoverSectionsFromDocument(): PageSectionDefinition[] {
  const seen = new Set<string>();
  const out: PageSectionDefinition[] = [];

  for (const el of document.querySelectorAll(SECTION_DOM_SELECTOR)) {
    const id = readSectionIdFromElement(el);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const label = el.getAttribute('data-section-label')?.trim() || id;
    out.push({ id, label });
  }

  return out;
}

/** Registry order first, then DOM-only sections in document order. */
export function mergeSectionDefinitions(
  registry: PageSectionDefinition[],
  discovered: PageSectionDefinition[],
): PageSectionDefinition[] {
  const registryIds = new Set(registry.map((s) => s.id));
  const merged = [...registry];
  for (const d of discovered) {
    if (!registryIds.has(d.id)) {
      merged.push(d);
    }
  }
  return merged;
}
