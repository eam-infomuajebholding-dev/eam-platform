import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import MaintenanceStepPanel from './MaintenanceStepPanel';

export default function SmartMaintenanceJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="smart-maintenance"
      StepPanel={MaintenanceStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
