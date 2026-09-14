import { getSectorBySlug, SECTOR_DEFINITIONS } from '@/data/sectors';
import { BUILD_VILLA_JOURNEY_TYPE } from '@/features/journeys/build-villa/types';
import type { AIActionProposal, PlatformResourceLink } from '@/features/ai-workspace/types';

const JOURNEY_TO_SECTOR_SLUG: Record<string, string> = {
  build_villa: 'build-villa',
  engineering_consulting: 'engineering-consulting',
  contracting: 'contracting',
  real_estate_valuation: 'real-estate-valuation',
  smart_maintenance: 'smart-maintenance',
  project_management: 'project-management',
  furnishing: 'furnishing',
  facility_management: 'facility-management',
  government_services: 'government-services',
  real_estate_development: 'real-estate-development',
  real_estate_marketing: 'real-estate-marketing',
  building_materials: 'building-materials',
  equipment: 'equipment',
};

export function getJourneyLabel(journeyType: string): string {
  const slug = JOURNEY_TO_SECTOR_SLUG[journeyType];
  if (slug) {
    const sector = getSectorBySlug(slug);
    if (sector) {
      return sector.title;
    }
  }
  return journeyType.replace(/_/g, ' ');
}

export function getJourneyRoute(journeyType: string): string | undefined {
  if (journeyType === BUILD_VILLA_JOURNEY_TYPE) {
    return '/journeys/build-villa';
  }
  const slug = JOURNEY_TO_SECTOR_SLUG[journeyType];
  if (!slug) {
    return undefined;
  }
  return getSectorBySlug(slug)?.route;
}

export function resolvePlatformResource(resourceRef: string): PlatformResourceLink | null {
  const trimmed = resourceRef.trim();
  if (!trimmed) {
    return null;
  }

  const journeyRoute = getJourneyRoute(trimmed);
  if (journeyRoute) {
    return {
      label: getJourneyLabel(trimmed),
      href: journeyRoute,
      ref: trimmed,
    };
  }

  const sector =
    getSectorBySlug(trimmed) ??
    getSectorBySlug(trimmed.replace(/_/g, '-')) ??
    SECTOR_DEFINITIONS.find((entry) => entry.route === trimmed);

  if (sector) {
    return { label: sector.title, href: sector.route, ref: trimmed };
  }

  if (trimmed.startsWith('/')) {
    const byRoute = SECTOR_DEFINITIONS.find((entry) => entry.route === trimmed);
    return {
      label: byRoute?.title ?? 'استكشف في المنصة',
      href: trimmed,
      ref: trimmed,
    };
  }

  return null;
}

export function extractResourceLinksFromActions(
  actions?: AIActionProposal[] | null,
): PlatformResourceLink[] {
  if (!actions?.length) {
    return [];
  }

  const links: PlatformResourceLink[] = [];
  const seen = new Set<string>();

  for (const proposal of actions) {
    if (proposal.action !== 'OPEN_RESOURCE' || !proposal.resource_ref) {
      continue;
    }
    const link = resolvePlatformResource(proposal.resource_ref);
    if (link && !seen.has(link.href)) {
      seen.add(link.href);
      links.push(link);
    }
  }

  return links;
}

export function resolveJourneyTypeFromTurn(
  actions?: AIActionProposal[] | null,
  fallbackAction?: string | null,
  fallbackJourneyType?: string | null,
): string | null {
  const startAction = actions?.find(
    (proposal) => proposal.action === 'START_JOURNEY' && proposal.journey_type,
  );
  if (startAction?.journey_type) {
    return startAction.journey_type;
  }
  if (fallbackAction === 'start_journey' && fallbackJourneyType) {
    return fallbackJourneyType;
  }
  return null;
}
