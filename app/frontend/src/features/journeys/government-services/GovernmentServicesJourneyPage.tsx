import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import GovernmentServicesStepPanel from './GovernmentServicesStepPanel';

export default function GovernmentServicesJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="government-services"
      StepPanel={GovernmentServicesStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
