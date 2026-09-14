import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import ContractingStepPanel from './ContractingStepPanel';

export default function ContractingJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="contracting"
      StepPanel={ContractingStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
