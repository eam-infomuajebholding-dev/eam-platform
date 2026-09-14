import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import BuildingMaterialsStepPanel from './BuildingMaterialsStepPanel';

export default function BuildingMaterialsJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="building-materials"
      StepPanel={BuildingMaterialsStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
