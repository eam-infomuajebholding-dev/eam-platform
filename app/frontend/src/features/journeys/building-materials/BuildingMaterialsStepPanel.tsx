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
  MATERIAL_CATEGORY_OPTIONS,
  PROCUREMENT_GOAL_OPTIONS,
  QUANTITY_SCOPE_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type BuildingMaterialsStepValues } from './errors';
import type { BuildingMaterialsContext } from './types';

type Props = JourneyStepPanelProps<BuildingMaterialsStepValues, BuildingMaterialsContext>;

export default function BuildingMaterialsStepPanel({
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
  const update = (patch: Partial<BuildingMaterialsStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'procurement_goal':
        return (
          <JourneySelectField
            label="ما هدفك من التوريد؟"
            value={values.procurementGoal}
            options={PROCUREMENT_GOAL_OPTIONS}
            onChange={(procurementGoal) => update({ procurementGoal })}
          />
        );
      case 'material_category':
        return (
          <JourneySelectField
            label="ما فئة المواد المطلوبة؟"
            value={values.materialCategory}
            options={MATERIAL_CATEGORY_OPTIONS}
            onChange={(materialCategory) => update({ materialCategory })}
          />
        );
      case 'project_context':
        return (
          <JourneyTextArea
            value={values.projectContext}
            onChange={(projectContext) => update({ projectContext })}
            placeholder="صف المشروع أو سياق التوريد المطلوب..."
          />
        );
      case 'delivery_location':
        return (
          <JourneyTextField
            value={values.deliveryLocation}
            onChange={(deliveryLocation) => update({ deliveryLocation })}
            placeholder="أين موقع التسليم؟ (المدينة/الموقع)"
          />
        );
      case 'quantity_scope':
        return (
          <JourneySelectField
            label="ما نطاق الكميات المتوقع؟"
            value={values.quantityScope}
            options={QUANTITY_SCOPE_OPTIONS}
            onChange={(quantityScope) => update({ quantityScope })}
          />
        );
      case 'specifications_context':
        return (
          <JourneyTextArea
            value={values.specificationsContext}
            onChange={(specificationsContext) => update({ specificationsContext })}
            placeholder="مواصفات أو معايير المواد إن وُجدت — اختياري"
            minHeight="80px"
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.targetTimeline}
              onChange={(targetTimeline) => update({ targetTimeline })}
              placeholder="متى تحتاج التوريد أو اتخاذ القرار؟"
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
      case 'supplier_context':
        return (
          <JourneyTextArea
            value={values.supplierContext}
            onChange={(supplierContext) => update({ supplierContext })}
            placeholder="مورد مفضل أو متطلبات مصدر التوريد — اختياري"
            minHeight="80px"
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>راجع ملخص طلبك قبل عرض موجز الجاهزية الأولي.</p>
            <ul className="list-disc pr-5">
              <li>الموقع: {values.deliveryLocation || '—'}</li>
              <li>السياق: {values.projectContext || '—'}</li>
              <li>الفئة: {values.materialCategory || '—'}</li>
            </ul>
          </div>
        );
      case 'procurement_readiness_brief':
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
