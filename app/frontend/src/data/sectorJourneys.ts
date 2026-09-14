import type { MessageKey } from '@/i18n/messages';

export type SectorJourneyLink = {
  to: string;
  labelKey: MessageKey;
};

/** Primary digital journey or destination per sector slug. */
export const SECTOR_JOURNEY_BY_SLUG: Record<string, SectorJourneyLink> = {
  'engineering-consulting': { to: '/journeys/engineering-consulting', labelKey: 'page.sector.startEc' },
  'build-villa': { to: '/journeys/build-villa', labelKey: 'page.sector.startBv' },
  contracting: { to: '/journeys/contracting', labelKey: 'page.sector.startContracting' },
  'real-estate-valuation': { to: '/journeys/real-estate-valuation', labelKey: 'page.sector.startValuation' },
  'smart-maintenance': { to: '/journeys/smart-maintenance', labelKey: 'page.sector.startMaintenance' },
  'project-management': { to: '/journeys/project-management', labelKey: 'page.sector.startPm' },
  furnishing: { to: '/journeys/furnishing', labelKey: 'page.sector.startFurnishing' },
  'facility-management': { to: '/journeys/facility-management', labelKey: 'page.sector.startFm' },
  'government-services': { to: '/journeys/government-services', labelKey: 'page.sector.startGs' },
  investment: { to: '/invest', labelKey: 'nav.invest' },
  'real-estate-development': { to: '/journeys/real-estate-development', labelKey: 'page.sector.startRed' },
  'real-estate-marketing': { to: '/journeys/real-estate-marketing', labelKey: 'page.sector.startRem' },
  'building-materials': { to: '/journeys/building-materials', labelKey: 'page.sector.startBm' },
  equipment: { to: '/journeys/equipment', labelKey: 'page.sector.startEquipment' },
};

export function getSectorJourney(slug: string): SectorJourneyLink | undefined {
  return SECTOR_JOURNEY_BY_SLUG[slug];
}
