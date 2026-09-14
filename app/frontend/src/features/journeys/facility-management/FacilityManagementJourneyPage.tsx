import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import FacilityManagementStepPanel from './FacilityManagementStepPanel';

export default function FacilityManagementJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="facility-management"
      StepPanel={FacilityManagementStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
