import { lazy, type ComponentType } from 'react';

export interface JourneyRouteDefinition {
  path: string;
  lazyImport: () => Promise<{ default: ComponentType }>;
}

export const JOURNEY_ROUTE_DEFINITIONS: JourneyRouteDefinition[] = [
  {
    path: 'build-villa',
    lazyImport: () => import('@/features/journeys/build-villa/BuildVillaJourneyPage'),
  },
  {
    path: 'engineering-consulting',
    lazyImport: () => import('@/features/journeys/engineering-consulting/EngineeringConsultingJourneyPage'),
  },
  {
    path: 'contracting',
    lazyImport: () => import('@/features/journeys/contracting/ContractingJourneyPage'),
  },
  {
    path: 'real-estate-valuation',
    lazyImport: () => import('@/features/journeys/real-estate-valuation/RealEstateValuationJourneyPage'),
  },
  {
    path: 'smart-maintenance',
    lazyImport: () => import('@/features/journeys/smart-maintenance/SmartMaintenanceJourneyPage'),
  },
  {
    path: 'project-management',
    lazyImport: () => import('@/features/journeys/project-management/ProjectManagementJourneyPage'),
  },
  {
    path: 'furnishing',
    lazyImport: () => import('@/features/journeys/furnishing/FurnishingJourneyPage'),
  },
  {
    path: 'facility-management',
    lazyImport: () => import('@/features/journeys/facility-management/FacilityManagementJourneyPage'),
  },
  {
    path: 'government-services',
    lazyImport: () => import('@/features/journeys/government-services/GovernmentServicesJourneyPage'),
  },
  {
    path: 'real-estate-development',
    lazyImport: () => import('@/features/journeys/real-estate-development/RealEstateDevelopmentJourneyPage'),
  },
  {
    path: 'real-estate-marketing',
    lazyImport: () => import('@/features/journeys/real-estate-marketing/RealEstateMarketingJourneyPage'),
  },
  {
    path: 'building-materials',
    lazyImport: () => import('@/features/journeys/building-materials/BuildingMaterialsJourneyPage'),
  },
  {
    path: 'equipment',
    lazyImport: () => import('@/features/journeys/equipment/EquipmentJourneyPage'),
  },
  {
    path: 'investment',
    lazyImport: () => import('@/features/journeys/investment/InvestmentJourneyPage'),
  },
  {
    path: 'factories-suppliers',
    lazyImport: () => import('@/features/journeys/factories-suppliers/FactoriesSuppliersJourneyPage'),
  },
  {
    path: 'delivery-warranty',
    lazyImport: () => import('@/features/journeys/delivery-warranty/DeliveryWarrantyJourneyPage'),
  },
];

export const lazyJourneyPages = Object.fromEntries(
  JOURNEY_ROUTE_DEFINITIONS.map(({ path, lazyImport }) => [path, lazy(lazyImport)]),
) as Record<string, ComponentType>;
