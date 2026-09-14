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
  EXISTING_ASSETS_OPTIONS,
  MARKETING_GOAL_OPTIONS,
  MARKETING_STAGE_OPTIONS,
  STEP_LABELS,
  TARGET_AUDIENCE_OPTIONS,
} from './constants';
import { type RealEstateMarketingStepValues } from './errors';
import type { RealEstateMarketingContext } from './types';

type Props = JourneyStepPanelProps<RealEstateMarketingStepValues, RealEstateMarketingContext>;

export default function RealEstateMarketingStepPanel({
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
  const update = (patch: Partial<RealEstateMarketingStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'marketing_goal':
        return (
          <JourneySelectField
            label="ما هدفك التسويقي؟"
            value={values.marketingGoal}
            options={MARKETING_GOAL_OPTIONS}
            onChange={(marketingGoal) => update({ marketingGoal })}
          />
        );
      case 'property_description':
        return (
          <JourneyTextArea
            value={values.propertyDescription}
            onChange={(propertyDescription) => update({ propertyDescription })}
            placeholder="صف العقار أو المشروع الذي تريد تسويقه..."
          />
        );
      case 'property_location':
        return (
          <JourneyTextField
            value={values.propertyLocation}
            onChange={(propertyLocation) => update({ propertyLocation })}
            placeholder="أين يقع العقار؟ (المدينة/الحي)"
          />
        );
      case 'target_audience':
        return (
          <JourneySelectField
            label="من هو الجمهور المستهدف؟"
            value={values.targetAudience}
            options={TARGET_AUDIENCE_OPTIONS}
            onChange={(targetAudience) => update({ targetAudience })}
          />
        );
      case 'marketing_stage':
        return (
          <JourneySelectField
            label="في أي مرحلة تسويقية أنت؟"
            value={values.marketingStage}
            options={MARKETING_STAGE_OPTIONS}
            onChange={(marketingStage) => update({ marketingStage })}
          />
        );
      case 'existing_assets':
        return (
          <JourneySelectField
            label="ما الأصول التسويقية المتوفرة لديك؟"
            value={values.existingAssets}
            options={EXISTING_ASSETS_OPTIONS}
            onChange={(existingAssets) => update({ existingAssets })}
          />
        );
      case 'channels_context':
        return (
          <JourneyTextArea
            value={values.channelsInterest}
            onChange={(channelsInterest) => update({ channelsInterest })}
            placeholder="قنوات أو اهتمامات تسويقية (منصات رقمية، وسيط، إعلانات...) — اختياري"
            minHeight="80px"
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.targetTimeline}
              onChange={(targetTimeline) => update({ targetTimeline })}
              placeholder="متى تحتاج بدء التسويق أو اتخاذ القرار؟"
            />
            <JourneySelectField
              label="الاستعجال (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'budget_context':
        return (
          <JourneyTextField
            value={values.budgetContext}
            onChange={(budgetContext) => update({ budgetContext })}
            placeholder="نطاق ميزانية تسويقية تقريبي إن وُجد — اختياري"
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>راجع ملخص طلبك قبل عرض موجز الجاهزية الأولي.</p>
            <ul className="list-disc pr-5">
              <li>الموقع: {values.propertyLocation || '—'}</li>
              <li>الوصف: {values.propertyDescription || '—'}</li>
              <li>الجمهور: {values.targetAudience || '—'}</li>
            </ul>
          </div>
        );
      case 'marketing_readiness_brief':
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
