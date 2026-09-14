import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import {
  useJourneyStandardConfirmStep,
  isStandardConfirmStep,
} from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import {
  JourneySelectField,
  JourneyTextArea,
  JourneyTextField,
} from '@/features/journeys/core/JourneyFieldControls';
import {
  ENGAGEMENT_GOAL_OPTIONS,
  FACILITY_SCOPE_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  OPERATIONAL_CHALLENGE_OPTIONS,
  SERVICE_MATURITY_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type FacilityManagementStepValues } from './errors';
import type { FacilityManagementContext } from './types';

type Props = JourneyStepPanelProps<FacilityManagementStepValues, FacilityManagementContext>;

export default function FacilityManagementStepPanel({
  currentStep,
  context,
  values,
  onChange,
  fieldErrors,
  formError,
  isLoading,
  isTerminal,
  isCompleted,
  onAdvance,
  onComplete,
  completedMessage,
  sectorId,
}: Props) {
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<FacilityManagementStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'facility_type':
        return (
          <JourneySelectField
            label="نوع المنشأة"
            value={values.facilityType}
            options={FACILITY_TYPE_OPTIONS}
            onChange={(facilityType) => update({ facilityType })}
          />
        );
      case 'asset_location':
        return (
          <JourneyTextField
            value={values.location}
            onChange={(location) => update({ location })}
            placeholder="أين تقع المنشأة أو الأصل؟"
          />
        );
      case 'facility_scope':
        return (
          <JourneySelectField
            label="نطاق المرافق"
            value={values.facilityScope}
            options={FACILITY_SCOPE_OPTIONS}
            onChange={(facilityScope) => update({ facilityScope })}
          />
        );
      case 'operational_challenge':
        return (
          <JourneySelectField
            label="التحدي التشغيلي"
            value={values.operationalChallenge}
            options={OPERATIONAL_CHALLENGE_OPTIONS}
            onChange={(operationalChallenge) => update({ operationalChallenge })}
          />
        );
      case 'service_maturity':
        return (
          <JourneySelectField
            label="نضج خدمات إدارة المرافق"
            value={values.serviceMaturity}
            options={SERVICE_MATURITY_OPTIONS}
            onChange={(serviceMaturity) => update({ serviceMaturity })}
          />
        );
      case 'engagement_goal':
        return (
          <JourneySelectField
            label="هدف التعاقد"
            value={values.engagementGoal}
            options={ENGAGEMENT_GOAL_OPTIONS}
            onChange={(engagementGoal) => update({ engagementGoal })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.targetTimeline}
              onChange={(targetTimeline) => update({ targetTimeline })}
              placeholder="متى تحتاج البدء أو اتخاذ القرار؟"
            />
            <JourneySelectField
              label="الاستعجال (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'readiness_context':
        return (
          <JourneyTextArea
            value={values.currentReadiness}
            onChange={(currentReadiness) => update({ currentReadiness })}
            placeholder="ما الوضع التشغيلي الحالي أو التحديات المعروفة؟ (اختياري)"
            minHeight="80px"
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>الموقع: {values.location}</p>
            <p>النطاق: {values.facilityScope}</p>
            <p>التحدي: {values.operationalChallenge}</p>
          </div>
        );
      case 'readiness_brief':
        return brief ? <PreliminaryBriefCard brief={brief} /> : null;
      default:
        return null;
    }
  };

  return (
    <JourneyStepPanelShell
      currentStep={currentStep}
      stepLabels={STEP_LABELS}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      onAdvance={onAdvance}
      onComplete={onComplete}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
