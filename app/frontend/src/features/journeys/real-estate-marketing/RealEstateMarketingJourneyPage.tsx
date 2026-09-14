import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import RealEstateMarketingStepPanel from './RealEstateMarketingStepPanel';

export default function RealEstateMarketingJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="real-estate-marketing"
      StepPanel={RealEstateMarketingStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
