/**
 * Canonical EAM visual asset registry — single source of truth.
 * Static imports for Vite bundling; swap values here for CMS/API migration later.
 *
 * Note: approved filenames use .webp in spec; source files are PNG (verified on import).
 */
import type { HomeImageKey, ProjectImageKey, SectorImageKey } from '@/config/assetKeys';

import hero from '@/assets/images/home/01-home-hero.png';
import aboutCinematic from '@/assets/images/home/02-home-about-cinematic.png';
import aboutEam from '@/assets/images/home/02-home-about-eam.png';
import oneStatement from '@/assets/images/home/02-home-one-statement.png';
import midContentBg from '@/assets/images/home/05-home-mid-content-bg.jpg';
import whatWeOfferBg from '@/assets/images/home/04-home-what-we-offer-bg.jpg';
import investmentBanner from '@/assets/images/home/03-home-investment-banner.png';
import footerCta from '@/assets/images/home/04-home-footer-cta.png';

import engineeringDesign from '@/assets/images/sectors/05-sector-engineering-design.png';
import realEstateDevelopment from '@/assets/images/sectors/06-sector-real-estate-development.png';
import realEstateInvestment from '@/assets/images/sectors/07-sector-real-estate-investment.png';
import realEstateMarketing from '@/assets/images/sectors/08-sector-real-estate-marketing.png';
import realEstateValuation from '@/assets/images/sectors/09-sector-real-estate-valuation.png';
import governmentServices from '@/assets/images/sectors/10-sector-government-services.png';
import projectManagement from '@/assets/images/sectors/11-sector-project-management.png';
import engineeringConsulting from '@/assets/images/sectors/12-sector-engineering-consulting.png';
import contractingExecution from '@/assets/images/sectors/13-sector-contracting-execution.png';
import buildingMaterials from '@/assets/images/sectors/14-sector-building-materials.png';
import equipmentMachinery from '@/assets/images/sectors/15-sector-equipment-machinery.png';
import factoriesSuppliers from '@/assets/images/sectors/16-sector-factories-suppliers.png';
import smartOperationsMaintenance from '@/assets/images/sectors/17-sector-smart-operations-maintenance.png';
import facilityManagement from '@/assets/images/sectors/18-sector-facility-management.png';
import interiorFitoutFurnishing from '@/assets/images/sectors/19-sector-interior-fitout-furnishing.png';
import handoverAfterSales from '@/assets/images/sectors/20-sector-handover-after-sales.png';

import luxuryResidential from '@/assets/images/projects/21-project-luxury-residential.png';
import businessCenter from '@/assets/images/projects/22-project-business-center.png';
import specializedHospital from '@/assets/images/projects/23-project-specialized-hospital.png';
import commercialTower from '@/assets/images/projects/24-project-commercial-tower.png';

export type EamImageAsset = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export const homeImages = {
  hero: {
    src: hero,
    alt: 'مشهد معماري حديث يعكس رؤية EAM للهندسة والاستثمار',
    objectPosition: 'center center',
  },
  aboutCinematic: {
    src: aboutCinematic,
    alt: 'غلاف فيلم إعمار الأصالة والمعاصرة',
    objectPosition: 'center center',
  },
  aboutEam: {
    src: aboutEam,
    alt: 'فريق هندسي سعودي يراجع المخططات ونموذج المشروع في مكتب معاصر',
    objectPosition: 'left center',
  },
  oneStatement: {
    src: oneStatement,
    alt: 'تفاصيل هندسية — مخططات ومواد ونماذج معمارية',
    objectPosition: 'left bottom',
  },
  whatWeOfferBg: {
    src: whatWeOfferBg,
    alt: 'واجهة معمارية — مبنى حديث مع مساحة بيضاء لماذا نقدم',
    objectPosition: 'left center',
  },
  midContentBg: {
    src: midContentBg,
    alt: 'مشهد معمارية — Engineering for a more resilient tomorrow',
    objectPosition: 'left top',
  },
  investmentBanner: {
    src: investmentBanner,
    alt: 'استثمر في مستقبل واعد — مسارات الاستثمار مع EAM',
    objectPosition: 'center center',
  },
  footerCta: {
    src: footerCta,
    alt: 'كن على اطلاع بآخر تحديثات منصة EAM',
    objectPosition: 'center center',
  },
} as const satisfies Record<string, EamImageAsset>;

/** Served from `public/media/` — final brand film (v10). */
export const HOME_ABOUT_CINEMATIC_VIDEO_SRC = '/media/eam-about-cinematic-v10.mp4';

/** Home first-screen promo — same asset as about cinematic until a dedicated cut exists. */
export const HOME_HERO_PROMO_VIDEO_SRC = HOME_ABOUT_CINEMATIC_VIDEO_SRC;

export const sectorImages = {
  engineeringDesign: {
    src: engineeringDesign,
    alt: 'التصميم الهندسي ضمن منصة EAM',
    objectPosition: 'center top',
  },
  realEstateDevelopment: {
    src: realEstateDevelopment,
    alt: 'التطوير العقاري ضمن منصة EAM',
    objectPosition: 'center top',
  },
  realEstateInvestment: {
    src: realEstateInvestment,
    alt: 'الاستثمار العقاري ضمن منصة EAM',
    objectPosition: 'center top',
  },
  realEstateMarketing: {
    src: realEstateMarketing,
    alt: 'التسويق العقاري ضمن منصة EAM',
    objectPosition: 'center top',
  },
  realEstateValuation: {
    src: realEstateValuation,
    alt: 'التقييم العقاري ضمن منصة EAM',
    objectPosition: 'center top',
  },
  governmentServices: {
    src: governmentServices,
    alt: 'الخدمات الحكومية ضمن منصة EAM',
    objectPosition: 'center top',
  },
  projectManagement: {
    src: projectManagement,
    alt: 'إدارة المشاريع ضمن منصة EAM',
    objectPosition: 'center top',
  },
  engineeringConsulting: {
    src: engineeringConsulting,
    alt: 'الاستشارات الهندسية ضمن منصة EAM',
    objectPosition: 'center top',
  },
  contractingExecution: {
    src: contractingExecution,
    alt: 'المقاولات والتنفيذ ضمن منصة EAM',
    objectPosition: 'center top',
  },
  buildingMaterials: {
    src: buildingMaterials,
    alt: 'حلول ومواد بناء ضمن منصة EAM',
    objectPosition: 'center top',
  },
  equipmentMachinery: {
    src: equipmentMachinery,
    alt: 'المعدات والآلات ضمن منصة EAM',
    objectPosition: 'center top',
  },
  factoriesSuppliers: {
    src: factoriesSuppliers,
    alt: 'المصانع والموردون ضمن منصة EAM',
    objectPosition: 'center top',
  },
  smartOperationsMaintenance: {
    src: smartOperationsMaintenance,
    alt: 'التشغيل والصيانة الذكية ضمن منصة EAM',
    objectPosition: 'center top',
  },
  facilityManagement: {
    src: facilityManagement,
    alt: 'إدارة وتشغيل المرافق ضمن منصة EAM',
    objectPosition: 'center top',
  },
  interiorFitoutFurnishing: {
    src: interiorFitoutFurnishing,
    alt: 'التأثيث والتجهيز ضمن منصة EAM',
    objectPosition: 'center top',
  },
  handoverAfterSales: {
    src: handoverAfterSales,
    alt: 'التسليم وخدمة ما بعد البيع ضمن منصة EAM',
    objectPosition: 'center top',
  },
} as const satisfies Record<string, EamImageAsset>;

export const projectImages = {
  luxuryResidential: {
    src: luxuryResidential,
    alt: 'مشروع سكني فاخر',
    objectPosition: 'center center',
  },
  businessCenter: {
    src: businessCenter,
    alt: 'مركز أعمال متكامل',
    objectPosition: 'center center',
  },
  specializedHospital: {
    src: specializedHospital,
    alt: 'مستشفى متخصص',
    objectPosition: 'center center',
  },
  commercialTower: {
    src: commercialTower,
    alt: 'برج تجاري',
    objectPosition: 'center center',
  },
} as const satisfies Record<string, EamImageAsset>;

export type { HomeImageKey, ProjectImageKey, SectorImageKey } from '@/config/assetKeys';

export function getHomeImage(key: HomeImageKey): EamImageAsset {
  return homeImages[key];
}

export function getSectorImageAsset(key: SectorImageKey): EamImageAsset {
  return sectorImages[key];
}

export function getProjectImageAsset(key: ProjectImageKey): EamImageAsset {
  return projectImages[key];
}
