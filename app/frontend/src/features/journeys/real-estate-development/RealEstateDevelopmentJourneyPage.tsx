import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import RealEstateDevelopmentStepPanel from './RealEstateDevelopmentStepPanel';

export default function RealEstateDevelopmentJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="real-estate-development"
      StepPanel={RealEstateDevelopmentStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
