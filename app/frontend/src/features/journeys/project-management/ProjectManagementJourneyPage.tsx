import SectorJourneyPage from '@/features/journeys/core/SectorJourneyPage';
import { STEP_ORDER } from './constants';
import { buildAdvanceInput, emptyValues, syncFromContext } from './errors';
import ProjectManagementStepPanel from './ProjectManagementStepPanel';

export default function ProjectManagementJourneyPage() {
  return (
    <SectorJourneyPage
      sectorId="project-management"
      StepPanel={ProjectManagementStepPanel}
      domain={{ stepOrder: STEP_ORDER, emptyValues, syncFromContext, buildAdvanceInput }}
    />
  );
}
