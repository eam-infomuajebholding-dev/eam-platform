import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import EquipmentStepPanel from './EquipmentStepPanel';

export default function EquipmentJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="equipment"
      StepPanel={EquipmentStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
