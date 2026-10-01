import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import InvestmentStepPanel from './InvestmentStepPanel';

export default function InvestmentJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="investment"
      StepPanel={InvestmentStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
