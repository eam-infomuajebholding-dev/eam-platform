/** Asset key vocabulary — no binary imports (safe for tests and data layers). */

export const HOME_IMAGE_KEYS = ['hero', 'aboutCinematic', 'investmentBanner', 'footerCta'] as const;
export type HomeImageKey = (typeof HOME_IMAGE_KEYS)[number];

export const SECTOR_IMAGE_KEYS = [
  'engineeringDesign',
  'realEstateDevelopment',
  'realEstateInvestment',
  'realEstateMarketing',
  'realEstateValuation',
  'governmentServices',
  'projectManagement',
  'engineeringConsulting',
  'contractingExecution',
  'buildingMaterials',
  'equipmentMachinery',
  'factoriesSuppliers',
  'smartOperationsMaintenance',
  'facilityManagement',
  'interiorFitoutFurnishing',
  'handoverAfterSales',
] as const;
export type SectorImageKey = (typeof SECTOR_IMAGE_KEYS)[number];

export const PROJECT_IMAGE_KEYS = [
  'luxuryResidential',
  'businessCenter',
  'specializedHospital',
  'commercialTower',
] as const;
export type ProjectImageKey = (typeof PROJECT_IMAGE_KEYS)[number];

export function isSectorImageKey(key: string): key is SectorImageKey {
  return (SECTOR_IMAGE_KEYS as readonly string[]).includes(key);
}
