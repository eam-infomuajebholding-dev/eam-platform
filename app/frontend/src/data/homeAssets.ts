/** Demo/presentation imagery for homepage — not live project records */

const u = (id: string, w = 480) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HOME_PROJECT_IMAGES: Record<number, string> = {
  1: u('photo-1486406146926-c627a92ad1ab', 640),
  2: u('photo-1545324418-cc1a3fa10c00', 480),
  3: u('photo-1512917774080-9991f1c4c750', 480),
  4: u('photo-1600596542815-ffad4c1539a9', 480),
  5: u('photo-1564013799919-ab600027ffc6', 480),
};

/**
 * Canonical sector artwork — deterministic filenames under /images/eam/sectors/
 * Status vocabulary: PRODUCED_AND_IMPORTED | PRODUCED_NOT_IMPORTED |
 * NOT_FOUND_IN_REPOSITORY_OR_LOCAL_INCOMING_PATHS | WRONG_SECTOR | WRONG_NUMBER |
 * REJECTED | UNKNOWN | NOT_PRODUCED
 */
export const SECTOR_ASSET_MANIFEST: Record<
  string,
  { file: string; objectPosition?: string }
> = {
  'real-estate-development': { file: '01-real-estate-development.png', objectPosition: 'center top' },
  'real-estate-marketing': { file: '02-real-estate-marketing.png', objectPosition: 'center top' },
  investment: { file: '03-investment.png', objectPosition: 'center top' },
  'build-villa': { file: '04-build-villa.png', objectPosition: 'center top' },
  'real-estate-valuation': { file: '05-real-estate-valuation.png', objectPosition: 'center top' },
  'government-services': { file: '06-government-services.png', objectPosition: 'center top' },
  'project-management': { file: '07-project-management.png', objectPosition: 'center top' },
  contracting: { file: '09-contracting.png', objectPosition: 'center top' },
  equipment: { file: '11-equipment-machinery.png', objectPosition: 'center top' },
  furnishing: { file: '15-furniture-fitout.png', objectPosition: 'center top' },
  // NOT_YET_PRODUCED: 08-engineering-consulting, 10-building-materials, 12-factories-suppliers,
  // 13-smart-maintenance, 14-facility-management, 16-delivery-owner-services
};

const SECTOR_ASSET_BASE = '/images/eam/sectors';

export function hasApprovedSectorArtwork(slug: string): boolean {
  return slug in SECTOR_ASSET_MANIFEST;
}

export function getSectorImage(slug: string): string | null {
  const entry = SECTOR_ASSET_MANIFEST[slug];
  if (!entry) return null;
  return `${SECTOR_ASSET_BASE}/${entry.file}`;
}

export function getSectorObjectPosition(slug: string): string {
  return SECTOR_ASSET_MANIFEST[slug]?.objectPosition ?? 'center center';
}

export function getProjectImage(id: number): string {
  return HOME_PROJECT_IMAGES[id] ?? HOME_PROJECT_IMAGES[1];
}
