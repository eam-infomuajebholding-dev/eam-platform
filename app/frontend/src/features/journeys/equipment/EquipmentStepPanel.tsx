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
  ENGAGEMENT_TYPE_OPTIONS,
  EQUIPMENT_CATEGORY_OPTIONS,
  EQUIPMENT_NEED_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type EquipmentStepValues } from './errors';
import type { EquipmentContext } from './types';

type Props = JourneyStepPanelProps<EquipmentStepValues, EquipmentContext>;

export default function EquipmentStepPanel({
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
  const update = (patch: Partial<EquipmentStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'equipment_need':
        return (
          <JourneySelectField
            label="ما حاجتك من المعدات؟"
            value={values.equipmentNeed}
            options={EQUIPMENT_NEED_OPTIONS}
            onChange={(equipmentNeed) => update({ equipmentNeed })}
          />
        );
      case 'equipment_category':
        return (
          <JourneySelectField
            label="ما فئة المعدات المطلوبة؟"
            value={values.equipmentCategory}
            options={EQUIPMENT_CATEGORY_OPTIONS}
            onChange={(equipmentCategory) => update({ equipmentCategory })}
          />
        );
      case 'usage_context':
        return (
          <JourneyTextArea
            value={values.usageContext}
            onChange={(usageContext) => update({ usageContext })}
            placeholder="صف سياق الاستخدام أو المشروع الذي تحتاج المعدات له..."
          />
        );
      case 'location':
        return (
          <JourneyTextField
            value={values.location}
            onChange={(location) => update({ location })}
            placeholder="أين موقع التشغيل؟ (المدينة/الموقع)"
          />
        );
      case 'engagement_type':
        return (
          <JourneySelectField
            label="ما نوع التعاقد المطلوب؟"
            value={values.engagementType}
            options={ENGAGEMENT_TYPE_OPTIONS}
            onChange={(engagementType) => update({ engagementType })}
          />
        );
      case 'specifications_context':
        return (
          <JourneyTextArea
            value={values.specificationsContext}
            onChange={(specificationsContext) => update({ specificationsContext })}
            placeholder="مواصفات أو قدرة أو موديل المعدات — اختياري"
            minHeight="80px"
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.targetTimeline}
              onChange={(targetTimeline) => update({ targetTimeline })}
              placeholder="متى تحتاج المعدات أو اتخاذ القرار؟"
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
            placeholder="سياق ميزانية تقريبي إن وُجد — اختياري"
          />
        );
      case 'readiness_context':
        return (
          <JourneyTextArea
            value={values.readinessContext}
            onChange={(readinessContext) => update({ readinessContext })}
            placeholder="جاهزية الموقع أو التشغيل إن وُجدت — اختياري"
            minHeight="80px"
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>راجع ملخص طلبك قبل عرض موجز الجاهزية الأولي.</p>
            <ul className="list-disc pr-5">
              <li>الموقع: {values.location || '—'}</li>
              <li>الاستخدام: {values.usageContext || '—'}</li>
              <li>الفئة: {values.equipmentCategory || '—'}</li>
            </ul>
          </div>
        );
      case 'equipment_readiness_brief':
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
