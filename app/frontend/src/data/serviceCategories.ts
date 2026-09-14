import type { PageMessageKey } from '@/i18n/pageMessages';

export type ServiceCategoryId = 'all' | 'develop' | 'engineer' | 'operate' | 'supply';

export type ServiceCategory = {
  id: ServiceCategoryId;
  labelKey: PageMessageKey;
  slugs: string[];
};

/** Groups the 16-sector registry for services page filtering. */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'all',
    labelKey: 'page.services.filter.all',
    slugs: [],
  },
  {
    id: 'develop',
    labelKey: 'page.services.filter.develop',
    slugs: [
      'real-estate-development',
      'real-estate-marketing',
      'investment',
      'build-villa',
      'real-estate-valuation',
    ],
  },
  {
    id: 'engineer',
    labelKey: 'page.services.filter.engineer',
    slugs: [
      'engineering-consulting',
      'project-management',
      'contracting',
      'government-services',
    ],
  },
  {
    id: 'operate',
    labelKey: 'page.services.filter.operate',
    slugs: ['smart-maintenance', 'facility-management', 'furnishing', 'delivery-warranty'],
  },
  {
    id: 'supply',
    labelKey: 'page.services.filter.supply',
    slugs: ['building-materials', 'equipment', 'factories-suppliers'],
  },
];

export function filterSectorsByCategory<T extends { slug: string }>(
  sectors: T[],
  categoryId: ServiceCategoryId,
): T[] {
  if (categoryId === 'all') {
    return sectors;
  }

  const category = SERVICE_CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) {
    return sectors;
  }

  return sectors.filter((sector) => category.slugs.includes(sector.slug));
}
