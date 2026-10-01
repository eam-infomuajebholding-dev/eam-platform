import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import FactoriesSuppliersStepPanel from './FactoriesSuppliersStepPanel';

export default function FactoriesSuppliersJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="factories-suppliers"
      StepPanel={FactoriesSuppliersStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
