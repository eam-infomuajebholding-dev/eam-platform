import type { JourneySectorId } from '@/i18n/journeySectorMessages';
import { BUILD_VILLA_JOURNEY_TYPE } from '@/features/journeys/build-villa/types';
import { ENGINEERING_CONSULTING_JOURNEY_TYPE } from '@/features/journeys/engineering-consulting/types';
import { CONTRACTING_JOURNEY_TYPE } from '@/features/journeys/contracting/types';
import { REAL_ESTATE_VALUATION_JOURNEY_TYPE } from '@/features/journeys/real-estate-valuation/types';
import { SMART_MAINTENANCE_JOURNEY_TYPE } from '@/features/journeys/smart-maintenance/types';
import { PROJECT_MANAGEMENT_JOURNEY_TYPE } from '@/features/journeys/project-management/types';
import { FURNISHING_JOURNEY_TYPE } from '@/features/journeys/furnishing/types';
import { FACILITY_MANAGEMENT_JOURNEY_TYPE } from '@/features/journeys/facility-management/types';
import { GOVERNMENT_SERVICES_JOURNEY_TYPE } from '@/features/journeys/government-services/types';
import { REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE } from '@/features/journeys/real-estate-development/types';
import { REAL_ESTATE_MARKETING_JOURNEY_TYPE } from '@/features/journeys/real-estate-marketing/types';
import { BUILDING_MATERIALS_JOURNEY_TYPE } from '@/features/journeys/building-materials/types';
import { EQUIPMENT_JOURNEY_TYPE } from '@/features/journeys/equipment/types';

export interface JourneySectorCatalogEntry {
  journeyType: string;
  terminalStep?: string;
  supportsRevisit?: boolean;
  progressVariant?: 'bar' | 'text';
}

export const JOURNEY_SECTOR_CATALOG: Record<JourneySectorId, JourneySectorCatalogEntry> = {
  'build-villa': {
    journeyType: BUILD_VILLA_JOURNEY_TYPE,
    terminalStep: 'intake_complete',
    supportsRevisit: true,
    progressVariant: 'text',
  },
  'engineering-consulting': {
    journeyType: ENGINEERING_CONSULTING_JOURNEY_TYPE,
    terminalStep: 'handoff_complete',
    progressVariant: 'bar',
  },
  contracting: {
    journeyType: CONTRACTING_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  'real-estate-valuation': {
    journeyType: REAL_ESTATE_VALUATION_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  'smart-maintenance': {
    journeyType: SMART_MAINTENANCE_JOURNEY_TYPE,
    terminalStep: 'intake_complete',
    progressVariant: 'bar',
  },
  'project-management': {
    journeyType: PROJECT_MANAGEMENT_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  furnishing: {
    journeyType: FURNISHING_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  'facility-management': {
    journeyType: FACILITY_MANAGEMENT_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  'government-services': {
    journeyType: GOVERNMENT_SERVICES_JOURNEY_TYPE,
    terminalStep: 'intake_complete',
    progressVariant: 'bar',
  },
  'real-estate-development': {
    journeyType: REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  'real-estate-marketing': {
    journeyType: REAL_ESTATE_MARKETING_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  'building-materials': {
    journeyType: BUILDING_MATERIALS_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
  equipment: {
    journeyType: EQUIPMENT_JOURNEY_TYPE,
    progressVariant: 'bar',
  },
};
