import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import { isStandardConfirmStep, useJourneyStandardConfirmStep } from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import { JourneySelectField, JourneyTextArea, JourneyTextField } from '@/features/journeys/core/JourneyFieldControls';
import {
  DOCUMENTATION_OPTIONS,
  HANDOVER_OPTIONS,
  OWNER_OBJECTIVE_OPTIONS,
  STEP_LABELS,
  STEP_ORDER,
} from './constants';
import type { DeliveryWarrantyStepValues } from './errors';
import type { DeliveryWarrantyContext } from './types';

type Props = JourneyStepPanelProps<DeliveryWarrantyStepValues, DeliveryWarrantyContext>;

export default function DeliveryWarrantyStepPanel(props: Props) {
  const { currentStep, context, values, onChange, fieldErrors, formError, isLoading, isTerminal, isCompleted, onAdvance, onComplete, onRevisit, completedMessage, sectorId } = props;
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<DeliveryWarrantyStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;
    if (isStandardConfirmStep(currentStep) && standardConfirm) return standardConfirm;
    switch (currentStep) {
      case 'handover_context':
        return <JourneySelectField label="سياق التسليم" value={values.handoverContext} options={HANDOVER_OPTIONS} onChange={(v) => update({ handoverContext: v })} error={fieldErrors.handover_context} />;
      case 'property_location':
        return <JourneyTextField label="موقع العقار" value={values.propertyLocation} onChange={(v) => update({ propertyLocation: v })} error={fieldErrors.property_location} />;
      case 'project_reference':
        return <JourneyTextField label="مرجع المشروع (اختياري)" value={values.projectReference} onChange={(v) => update({ projectReference: v })} optional />;
      case 'issue_description':
        return <JourneyTextArea label="وصف الحالة" value={values.issueDescription} onChange={(v) => update({ issueDescription: v })} error={fieldErrors.issue_description} />;
      case 'documentation_state':
        return <JourneySelectField label="حالة المستندات" value={values.documentationState} options={DOCUMENTATION_OPTIONS} onChange={(v) => update({ documentationState: v })} error={fieldErrors.documentation_state} />;
      case 'owner_objective':
        return <JourneySelectField label="هدف المالك" value={values.ownerObjective} options={OWNER_OBJECTIVE_OPTIONS} onChange={(v) => update({ ownerObjective: v })} error={fieldErrors.owner_objective} />;
      case 'timeline_context':
        return (
          <>
            <JourneyTextField label="الجدول" value={values.targetTimeline} onChange={(v) => update({ targetTimeline: v })} error={fieldErrors.target_timeline} />
            <JourneySelectField label="الاستعجال" value={values.urgency} options={urgencyOptions} onChange={(v) => update({ urgency: v })} optional />
          </>
        );
      case 'handover_support_brief':
        return brief ? <PreliminaryBriefCard brief={brief} /> : null;
      default:
        return null;
    }
  };

  return (
    <JourneyStepPanelShell
      currentStep={currentStep}
      stepLabels={STEP_LABELS}
      stepOrder={STEP_ORDER}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
