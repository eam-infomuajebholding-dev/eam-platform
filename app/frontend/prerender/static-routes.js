/** Public marketing routes for sitemap generation (build time). */

const MARKETING = [
  '/',
  '/about',
  '/services',
  '/projects',
  '/team',
  '/consultation',
  '/market',
  '/contact',
  '/careers',
  '/invest',
  '/contact-card',
  '/engineering-services',
  '/government-services',
  '/services/contracting',
  '/services/maintenance',
  '/services/real-estate-development',
  '/services/real-estate-marketing',
];

const JOURNEYS = [
  '/journeys/build-villa',
  '/journeys/engineering-consulting',
  '/journeys/contracting',
  '/journeys/real-estate-valuation',
  '/journeys/smart-maintenance',
  '/journeys/project-management',
  '/journeys/furnishing',
  '/journeys/facility-management',
  '/journeys/government-services',
  '/journeys/real-estate-development',
  '/journeys/real-estate-marketing',
  '/journeys/building-materials',
  '/journeys/equipment',
];

const SECTOR_SLUGS = [
  'real-estate-development',
  'real-estate-marketing',
  'investment',
  'build-villa',
  'contracting',
  'building-materials',
  'equipment',
  'factories-suppliers',
  'real-estate-valuation',
  'government-services',
  'project-management',
  'engineering-consulting',
  'smart-maintenance',
  'facility-management',
  'furnishing',
  'delivery-warranty',
];

export function getStaticRoutes() {
  const sectors = SECTOR_SLUGS.map((slug) => `/sectors/${slug}`);
  return [...MARKETING, ...JOURNEYS, ...sectors];
}
