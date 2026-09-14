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
  ASSET_CONTEXT_OPTIONS,
  CURRENT_STATUS_OPTIONS,
  DOCUMENTS_READINESS_OPTIONS,
  INTENDED_USE_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type RealEstateDevelopmentStepValues } from './errors';
import type { RealEstateDevelopmentContext } from './types';

type Props = JourneyStepPanelProps<RealEstateDevelopmentStepValues, RealEstateDevelopmentContext>;

export default function RealEstateDevelopmentStepPanel({
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
  const update = (patch: Partial<RealEstateDevelopmentStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'asset_context':
        return (
          <JourneySelectField
            label="ما سياق الأصل أو الفرصة؟"
            value={values.assetContext}
            options={ASSET_CONTEXT_OPTIONS}
            onChange={(assetContext) => update({ assetContext })}
          />
        );
      case 'asset_location':
        return (
          <JourneyTextField
            value={values.assetLocation}
            onChange={(assetLocation) => update({ assetLocation })}
            placeholder="أين يقع الأصل؟ (المدينة/الحي)"
          />
        );
      case 'development_objective':
        return (
          <JourneyTextArea
            value={values.developmentObjective}
            onChange={(developmentObjective) => update({ developmentObjective })}
            placeholder="صف هدفك التطويري — ما الذي تريد تحقيقه؟"
          />
        );
      case 'intended_use':
        return (
          <JourneySelectField
            label="الاستخدام المستهدف"
            value={values.intendedUse}
            options={INTENDED_USE_OPTIONS}
            onChange={(intendedUse) => update({ intendedUse })}
          />
        );
      case 'current_status':
        return (
          <JourneySelectField
            label="الحالة الحالية للأصل"
            value={values.currentStatus}
            options={CURRENT_STATUS_OPTIONS}
            onChange={(currentStatus) => update({ currentStatus })}
          />
        );
      case 'constraints_context':
        return (
          <JourneyTextArea
            value={values.knownConstraints}
            onChange={(knownConstraints) => update({ knownConstraints })}
            placeholder="قيود معروفة (تنظيمية/مالية/زمنية) إن وجدت — اختياري"
            minHeight="80px"
          />
        );
      case 'documents_readiness':
        return (
          <JourneySelectField
            label="ما حالة المستندات المتاحة؟"
            value={values.documentsReadiness}
            options={DOCUMENTS_READINESS_OPTIONS}
            onChange={(documentsReadiness) => update({ documentsReadiness })}
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
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>راجع ملخص فرصتك قبل عرض اللقطة الأولية.</p>
            <ul className="list-disc pr-5">
              <li>الموقع: {values.assetLocation || '—'}</li>
              <li>الهدف: {values.developmentObjective || '—'}</li>
              <li>الاستخدام: {values.intendedUse || '—'}</li>
            </ul>
          </div>
        );
      case 'opportunity_snapshot_brief':
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
