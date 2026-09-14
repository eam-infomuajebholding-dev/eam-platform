import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import EngineeringConsultingStepPanel from './EngineeringConsultingStepPanel';

export default function EngineeringConsultingJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="engineering-consulting"
      StepPanel={EngineeringConsultingStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
