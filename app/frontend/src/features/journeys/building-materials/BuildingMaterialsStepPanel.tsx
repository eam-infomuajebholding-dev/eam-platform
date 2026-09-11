import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  MATERIAL_CATEGORY_OPTIONS,
  PROCUREMENT_GOAL_OPTIONS,
  QUANTITY_SCOPE_OPTIONS,
  STEP_LABELS,
  URGENCY_OPTIONS,
} from './constants';
import {
  getErrorMessage,
  type FieldValidationErrorDetail,
  type BuildingMaterialsStepValues,
} from './errors';
import type { BuildingMaterialsContext } from './types';

interface Props {
  currentStep: string | null;
  context: BuildingMaterialsContext;
  values: BuildingMaterialsStepValues;
  onChange: (values: BuildingMaterialsStepValues) => void;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  onAdvance: () => void;
  onComplete: () => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block font-tajawal text-sm">
      <span className="mb-1 block text-gray-600 dark:text-white/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-3 py-2"
      >
        <option value="">اختر...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

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
}: Props) {
  const update = (patch: Partial<BuildingMaterialsStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'procurement_goal') {
      return (
        <SelectField
          label="ما هدفك من التوريد؟"
          value={values.procurementGoal}
          options={PROCUREMENT_GOAL_OPTIONS}
          onChange={(procurementGoal) => update({ procurementGoal })}
        />
      );
    }

    if (currentStep === 'material_category') {
      return (
        <SelectField
          label="ما فئة المواد المطلوبة؟"
          value={values.materialCategory}
          options={MATERIAL_CATEGORY_OPTIONS}
          onChange={(materialCategory) => update({ materialCategory })}
        />
      );
    }

    if (currentStep === 'project_context') {
      return (
        <textarea
          value={values.projectContext}
          onChange={(e) => update({ projectContext: e.target.value })}
          className="min-h-[120px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="صف المشروع أو سياق التوريد المطلوب..."
        />
      );
    }

    if (currentStep === 'delivery_location') {
      return (
        <input
          type="text"
          value={values.deliveryLocation}
          onChange={(e) => update({ deliveryLocation: e.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="أين موقع التسليم؟ (المدينة/الموقع)"
        />
      );
    }

    if (currentStep === 'quantity_scope') {
      return (
        <SelectField
          label="ما نطاق الكميات المتوقع؟"
          value={values.quantityScope}
          options={QUANTITY_SCOPE_OPTIONS}
          onChange={(quantityScope) => update({ quantityScope })}
        />
      );
    }

    if (currentStep === 'specifications_context') {
      return (
        <textarea
          value={values.specificationsContext}
          onChange={(e) => update({ specificationsContext: e.target.value })}
          className="min-h-[80px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="مواصفات أو معايير المواد إن وُجدت — اختياري"
        />
      );
    }

    if (currentStep === 'timeline_context') {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={values.targetTimeline}
            onChange={(e) => update({ targetTimeline: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="متى تحتاج التوريد أو اتخاذ القرار؟"
          />
          <SelectField
            label="الاستعجال (اختياري)"
            value={values.urgency}
            options={URGENCY_OPTIONS}
            onChange={(urgency) => update({ urgency })}
          />
        </div>
      );
    }

    if (currentStep === 'budget_context') {
      return (
        <input
          type="text"
          value={values.budgetContext}
          onChange={(e) => update({ budgetContext: e.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="سياق ميزانية تقريبي إن وُجد — اختياري"
        />
      );
    }

    if (currentStep === 'supplier_context') {
      return (
        <textarea
          value={values.supplierContext}
          onChange={(e) => update({ supplierContext: e.target.value })}
          className="min-h-[80px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="مورد مفضل أو متطلبات مصدر التوريد — اختياري"
        />
      );
    }

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>راجع ملخص طلبك قبل عرض موجز الجاهزية الأولي.</p>
          <ul className="list-disc pr-5">
            <li>الموقع: {values.deliveryLocation || '—'}</li>
            <li>السياق: {values.projectContext || '—'}</li>
            <li>الفئة: {values.materialCategory || '—'}</li>
          </ul>
        </div>
      );
    }

    if (currentStep === 'procurement_readiness_brief' && brief) {
      return <PreliminaryBriefCard brief={brief} />;
    }

    if (currentStep === 'scope_confirm') {
      return (
        <label className="flex items-start gap-3 font-tajawal text-sm">
          <input
            type="checkbox"
            checked={values.scopeConfirmed}
            onChange={(e) => update({ scopeConfirmed: e.target.checked })}
            className="mt-1"
          />
          <span>
            أؤكد أن المعلومات المقدّمة دقيقة على قدر علمي — هذا موجز أولي وليس عرض سعر أو التزام توريد.
          </span>
        </label>
      );
    }

    if (currentStep === 'submit_confirm') {
      return (
        <div className="space-y-3 font-tajawal">
          <p className="text-sm text-gray-600 dark:text-white/70">
            تم تجهيز موجز جاهزية توريد مواد البناء الأولي. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.submitConfirmed}
              onChange={(e) => update({ submitConfirmed: e.target.checked })}
            />
            <span>أؤكد رغبتي في إرسال الطلب للمراجعة المهنية.</span>
          </label>
        </div>
      );
    }

    if (currentStep === 'intake_complete') {
      return (
        <p className="font-tajawal text-sm text-gray-600 dark:text-white/70">
          تم إكمال رحلة مواد البناء.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return (
      <p className="font-tajawal text-green-700 dark:text-green-300">
        تم إرسال طلب مواد البناء بنجاح.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {currentStep ? (
        <h2 className="text-lg font-bold font-tajawal text-gray-900 dark:text-white">
          {STEP_LABELS[currentStep] ?? currentStep}
        </h2>
      ) : null}
      {renderFields()}
      {formError ? (
        <p className="text-sm text-red-600 dark:text-red-300 font-tajawal">
          {getErrorMessage(fieldErrors, formError)}
        </p>
      ) : null}
      {!isTerminal ? (
        <button
          type="button"
          onClick={onAdvance}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-tajawal font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          متابعة
        </button>
      ) : (
        <button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-tajawal font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إنهاء وإرسال الطلب
        </button>
      )}
    </div>
  );
}
