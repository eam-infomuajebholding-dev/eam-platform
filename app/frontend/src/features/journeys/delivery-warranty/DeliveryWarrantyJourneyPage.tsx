import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import DeliveryWarrantyStepPanel from './DeliveryWarrantyStepPanel';

export default function DeliveryWarrantyJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="delivery-warranty"
      StepPanel={DeliveryWarrantyStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
