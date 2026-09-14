import type { SectorImageKey } from '@/config/assetKeys';
import type { LucideIcon } from 'lucide-react';
import {
  HardHat,
  Package,
  Cog,
  Factory,
  Home,
  Landmark,
  ClipboardList,
  Ruler,
  Wrench,
  Building,
  Sofa,
  Truck,
  Building2,
  Megaphone,
  TrendingUp,
  House,
} from 'lucide-react';

export type SectorDefinition = {
  number: number;
  slug: string;
  title: string;
  icon: LucideIcon;
  /** Approved sector artwork key — resolved via config/assets */
  imageKey: SectorImageKey;
  /** Fallback when artwork unavailable (legacy gradient) */
  imagePlaceholder: string;
  route: string;
};

const SECTOR_DEFINITIONS_RAW: SectorDefinition[] = [
  {
    number: 1,
    slug: 'real-estate-development',
    title: 'التطوير العقاري',
    icon: Building2,
    imageKey: 'realEstateDevelopment',
    imagePlaceholder: 'linear-gradient(135deg, #FBF1E4 0%, #C5A059 100%)',
    route: '/services/real-estate-development',
  },
  {
    number: 2,
    slug: 'real-estate-marketing',
    title: 'التسويق العقاري',
    icon: Megaphone,
    imageKey: 'realEstateMarketing',
    imagePlaceholder: 'linear-gradient(135deg, #FCEEDD 0%, #9A6B1F 100%)',
    route: '/services/real-estate-marketing',
  },
  {
    number: 3,
    slug: 'investment',
    title: 'الاستثمار',
    icon: TrendingUp,
    imageKey: 'realEstateInvestment',
    imagePlaceholder: 'linear-gradient(135deg, #E6CFAE 0%, #C5A059 100%)',
    route: '/invest',
  },
  {
    number: 4,
    slug: 'build-villa',
    title: 'بناء منزل',
    icon: House,
    imageKey: 'engineeringDesign',
    imagePlaceholder: 'linear-gradient(135deg, #FAEBDD 0%, #9A6B1F 100%)',
    route: '/journeys/build-villa',
  },
  {
    number: 9,
    slug: 'contracting',
    title: 'المقاولات والتشييد',
    icon: HardHat,
    imageKey: 'contractingExecution',
    imagePlaceholder: 'linear-gradient(135deg, #C5A059 0%, #9A6B1F 100%)',
    route: '/services/contracting',
  },
  {
    number: 10,
    slug: 'building-materials',
    title: 'مواد البناء',
    icon: Package,
    imageKey: 'buildingMaterials',
    imagePlaceholder: 'linear-gradient(135deg, #E6CFAE 0%, #C5A059 100%)',
    route: '/sectors/building-materials',
  },
  {
    number: 11,
    slug: 'equipment',
    title: 'المعدات والآلات',
    icon: Cog,
    imageKey: 'equipmentMachinery',
    imagePlaceholder: 'linear-gradient(135deg, #FAEBDD 0%, #C5A059 100%)',
    route: '/sectors/equipment',
  },
  {
    number: 12,
    slug: 'factories-suppliers',
    title: 'المصانع والموردين',
    icon: Factory,
    imageKey: 'factoriesSuppliers',
    imagePlaceholder: 'linear-gradient(135deg, #C5A059 0%, #2F2922 100%)',
    route: '/sectors/factories-suppliers',
  },
  {
    number: 5,
    slug: 'real-estate-valuation',
    title: 'التقييم العقاري',
    icon: Home,
    imageKey: 'realEstateValuation',
    imagePlaceholder: 'linear-gradient(135deg, #FCEEDD 0%, #9A6B1F 100%)',
    route: '/sectors/real-estate-valuation',
  },
  {
    number: 6,
    slug: 'government-services',
    title: 'الخدمات الحكومية',
    icon: Landmark,
    imageKey: 'governmentServices',
    imagePlaceholder: 'linear-gradient(135deg, #E6CFAE 0%, #9A6B1F 100%)',
    route: '/government-services',
  },
  {
    number: 7,
    slug: 'project-management',
    title: 'إدارة المشاريع',
    icon: ClipboardList,
    imageKey: 'projectManagement',
    imagePlaceholder: 'linear-gradient(135deg, #FBF1E4 0%, #C5A059 100%)',
    route: '/sectors/project-management',
  },
  {
    number: 8,
    slug: 'engineering-consulting',
    title: 'الاستشارات الهندسية',
    icon: Ruler,
    imageKey: 'engineeringConsulting',
    imagePlaceholder: 'linear-gradient(135deg, #C5A059 0%, #E6CFAE 100%)',
    route: '/engineering-services',
  },
  {
    number: 13,
    slug: 'smart-maintenance',
    title: 'التشغيل والصيانة الذكية',
    icon: Wrench,
    imageKey: 'smartOperationsMaintenance',
    imagePlaceholder: 'linear-gradient(135deg, #9A6B1F 0%, #C5A059 100%)',
    route: '/services/maintenance',
  },
  {
    number: 14,
    slug: 'facility-management',
    title: 'إدارة المرافق',
    icon: Building,
    imageKey: 'facilityManagement',
    imagePlaceholder: 'linear-gradient(135deg, #FAEBDD 0%, #9A6B1F 100%)',
    route: '/sectors/facility-management',
  },
  {
    number: 15,
    slug: 'furnishing',
    title: 'التأثيث والتجهيز',
    icon: Sofa,
    imageKey: 'interiorFitoutFurnishing',
    imagePlaceholder: 'linear-gradient(135deg, #E6CFAE 0%, #FBF1E4 100%)',
    route: '/sectors/furnishing',
  },
  {
    number: 16,
    slug: 'delivery-warranty',
    title: 'التسليم وخدمات الملاك',
    icon: Truck,
    imageKey: 'handoverAfterSales',
    imagePlaceholder: 'linear-gradient(135deg, #C5A059 0%, #2F2922 80%)',
    route: '/sectors/delivery-warranty',
  },
];

/** All 16 sectors in numeric order for homepage display */
export const SECTOR_DEFINITIONS: SectorDefinition[] = [...SECTOR_DEFINITIONS_RAW].sort(
  (a, b) => a.number - b.number,
);

export function getSectorBySlug(slug: string): SectorDefinition | undefined {
  return SECTOR_DEFINITIONS.find((s) => s.slug === slug);
}

/** Canonical route path for a sector slug (preserves intentional special routes). */
export function resolveSectorRoute(slug: string): string | undefined {
  return getSectorBySlug(slug)?.route;
}

/** Registry validation for tests and CI — 16 sectors, unique slugs, resolvable routes. */
export function validateSectorRegistry(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (SECTOR_DEFINITIONS.length !== 16) {
    errors.push(`expected 16 sectors, found ${SECTOR_DEFINITIONS.length}`);
  }
  const slugs = SECTOR_DEFINITIONS.map((s) => s.slug);
  const routes = SECTOR_DEFINITIONS.map((s) => s.route);
  if (new Set(slugs).size !== slugs.length) {
    errors.push('duplicate sector slugs detected');
  }
  if (new Set(routes).size !== routes.length) {
    errors.push('duplicate sector routes detected');
  }
  for (const sector of SECTOR_DEFINITIONS) {
    if (!sector.route.startsWith('/')) {
      errors.push(`invalid route for ${sector.slug}: ${sector.route}`);
    }
    if (!sector.imageKey) {
      errors.push(`missing imageKey for ${sector.slug}`);
    }
  }
  const imageKeys = SECTOR_DEFINITIONS.map((s) => s.imageKey);
  if (new Set(imageKeys).size !== imageKeys.length) {
    errors.push('duplicate sector imageKey detected');
  }
  return { ok: errors.length === 0, errors };
}
