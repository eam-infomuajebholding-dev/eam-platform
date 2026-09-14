import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import BuildVillaStepPanel from './BuildVillaStepPanel';

export default function BuildVillaJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="build-villa"
      StepPanel={BuildVillaStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
