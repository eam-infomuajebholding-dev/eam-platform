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
  BUDGET_RANGE_OPTIONS,
  FURNISHING_GOAL_OPTIONS,
  PROCUREMENT_PREFERENCE_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  SPACE_TYPE_OPTIONS,
  STEP_LABELS,
  STYLE_DIRECTION_OPTIONS,
} from './constants';
import { type FurnishingStepValues } from './errors';
import type { FurnishingContext } from './types';

type Props = JourneyStepPanelProps<FurnishingStepValues, FurnishingContext>;

export default function FurnishingStepPanel({
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
  const update = (patch: Partial<FurnishingStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'space_type':
        return (
          <JourneySelectField
            label="نوع المساحة"
            value={values.spaceType}
            options={SPACE_TYPE_OPTIONS}
            onChange={(spaceType) => update({ spaceType })}
          />
        );
      case 'project_stage':
        return (
          <JourneySelectField
            label="مرحلة المشروع"
            value={values.projectStage}
            options={PROJECT_STAGE_OPTIONS}
            onChange={(projectStage) => update({ projectStage })}
          />
        );
      case 'furnishing_goal':
        return (
          <JourneySelectField
            label="هدف التأثيث"
            value={values.furnishingGoal}
            options={FURNISHING_GOAL_OPTIONS}
            onChange={(furnishingGoal) => update({ furnishingGoal })}
          />
        );
      case 'style_direction':
        return (
          <JourneySelectField
            label="اتجاه التصميم"
            value={values.styleDirection}
            options={STYLE_DIRECTION_OPTIONS}
            onChange={(styleDirection) => update({ styleDirection })}
          />
        );
      case 'functional_priorities':
        return (
          <JourneyTextArea
            value={values.functionalPriorities}
            onChange={(functionalPriorities) => update({ functionalPriorities })}
            placeholder="ما أهم الأولويات الوظيفية أو احتياجات الاستخدام؟"
            minHeight="100px"
          />
        );
      case 'room_scope':
        return (
          <JourneyTextArea
            value={values.roomScope}
            onChange={(roomScope) => update({ roomScope })}
            placeholder="ما الغرف أو المساحات المستهدفة؟"
            minHeight="80px"
          />
        );
      case 'budget_range':
        return (
          <JourneySelectField
            label="فئة الميزانية"
            value={values.budgetRange}
            options={BUDGET_RANGE_OPTIONS}
            onChange={(budgetRange) => update({ budgetRange })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.targetTimeline}
              onChange={(targetTimeline) => update({ targetTimeline })}
              placeholder="متى تحتاج إنجاز التأثيث؟"
            />
            <JourneySelectField
              label="الاستعجال (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'procurement_preference':
        return (
          <JourneySelectField
            label="تفضيل التوريد"
            value={values.procurementPreference}
            options={PROCUREMENT_PREFERENCE_OPTIONS}
            onChange={(procurementPreference) => update({ procurementPreference })}
          />
        );
      case 'readiness_context':
        return (
          <JourneyTextArea
            value={values.currentReadiness}
            onChange={(currentReadiness) => update({ currentReadiness })}
            placeholder="ما الجاهزية الحالية للمساحة؟ (اختياري)"
            minHeight="80px"
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>{values.functionalPriorities}</p>
            <p>النطاق: {values.roomScope}</p>
            <p>الهدف: {values.furnishingGoal}</p>
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
