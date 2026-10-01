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
  ASSET_TYPE_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  INSPECTION_OPTIONS,
  OWNERSHIP_OPTIONS,
  STEP_LABELS,
  STEP_ORDER,
  VALUATION_PURPOSE_OPTIONS,
} from './constants';
import { type ValuationStepValues } from './errors';
import type { RealEstateValuationContext } from './types';

type Props = JourneyStepPanelProps<ValuationStepValues, RealEstateValuationContext>;

export default function ValuationStepPanel({
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
  onRevisit,
  completedMessage,
  sectorId,
}: Props) {
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<ValuationStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'valuation_purpose':
        return (
          <JourneySelectField
            label="غرض التقييم"
            value={values.valuationPurpose}
            options={VALUATION_PURPOSE_OPTIONS}
            onChange={(valuationPurpose) => update({ valuationPurpose })}
          />
        );
      case 'asset_type':
        return (
          <JourneySelectField
            label="نوع الأصل"
            value={values.assetType}
            options={ASSET_TYPE_OPTIONS}
            onChange={(assetType) => update({ assetType })}
          />
        );
      case 'asset_location':
        return (
          <JourneyTextField
            value={values.location}
            onChange={(location) => update({ location })}
            placeholder="المدينة / الموقع"
          />
        );
      case 'asset_description':
        return (
          <div className="space-y-3">
            <JourneyTextArea
              value={values.assetDescription}
              onChange={(assetDescription) => update({ assetDescription })}
              placeholder="صف العقار واستخدامه والحالة العامة..."
            />
            <JourneyTextField
              value={values.areaSqm}
              onChange={(areaSqm) => update({ areaSqm })}
              placeholder="المساحة بالم² (اختياري)"
            />
          </div>
        );
      case 'ownership_context':
        return (
          <JourneySelectField
            label="سياق الملكية"
            value={values.ownershipStatus}
            options={OWNERSHIP_OPTIONS}
            onChange={(ownershipStatus) => update({ ownershipStatus })}
          />
        );
      case 'document_readiness':
        return (
          <div className="space-y-2 text-sm">
            {[
              ['deedAvailable', 'صك / سند ملكية متوفر'],
              ['titleDocsAvailable', 'مستندات ملكية إضافية'],
              ['rentRollAvailable', 'كشف إيرادات / إيجارات'],
              ['plansAvailable', 'مخططات أو مستندات داعمة'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values[key as keyof ValuationStepValues] === true}
                  onChange={(e) => update({ [key]: e.target.checked } as Partial<ValuationStepValues>)}
                />
                {label}
              </label>
            ))}
            <JourneyTextArea
              value={values.documentNotes}
              onChange={(documentNotes) => update({ documentNotes })}
              placeholder="ملاحظات المستندات (اختياري)"
              minHeight="80px"
            />
          </div>
        );
      case 'inspection_readiness':
        return (
          <JourneySelectField
            label="جاهزية المعاينة"
            value={values.inspectionReadiness}
            options={INSPECTION_OPTIONS}
            onChange={(inspectionReadiness) => update({ inspectionReadiness })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.desiredTimeline}
              onChange={(desiredTimeline) => update({ desiredTimeline })}
              placeholder="متى تحتاج التقييم؟"
            />
            <JourneySelectField
              label="الاستعجال (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'engagement_goal':
        return (
          <JourneySelectField
            label="هدف الخدمة"
            value={values.engagementGoal}
            options={ENGAGEMENT_GOAL_OPTIONS}
            onChange={(engagementGoal) => update({ engagementGoal })}
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>{values.assetDescription}</p>
            <p>الموقع: {values.location}</p>
            <p>الغرض: {values.valuationPurpose}</p>
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
      stepOrder={STEP_ORDER}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
