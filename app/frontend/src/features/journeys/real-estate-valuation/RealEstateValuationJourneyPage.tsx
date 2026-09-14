import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import ValuationStepPanel from './ValuationStepPanel';

export default function RealEstateValuationJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="real-estate-valuation"
      StepPanel={ValuationStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
