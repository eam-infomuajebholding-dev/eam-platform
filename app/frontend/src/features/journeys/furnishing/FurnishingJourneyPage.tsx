import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import FurnishingStepPanel from './FurnishingStepPanel';

export default function FurnishingJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="furnishing"
      StepPanel={FurnishingStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
