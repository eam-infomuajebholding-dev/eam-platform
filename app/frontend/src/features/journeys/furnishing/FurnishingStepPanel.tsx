import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  BUDGET_RANGE_OPTIONS,
  FURNISHING_GOAL_OPTIONS,
  PROCUREMENT_PREFERENCE_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  SPACE_TYPE_OPTIONS,
  STEP_LABELS,
  STYLE_DIRECTION_OPTIONS,
} from './constants';
import { getErrorMessage, type FieldValidationErrorDetail, type FurnishingStepValues } from './errors';
import type { FurnishingContext } from './types';

interface Props {
  currentStep: string | null;
  context: FurnishingContext;
  values: FurnishingStepValues;
  onChange: (values: FurnishingStepValues) => void;
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
}: Props) {
  const update = (patch: Partial<FurnishingStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'space_type') {
      return (
        <SelectField
          label="نوع المساحة"
          value={values.spaceType}
          options={SPACE_TYPE_OPTIONS}
          onChange={(spaceType) => update({ spaceType })}
        />
      );
    }

    if (currentStep === 'project_stage') {
      return (
        <SelectField
          label="مرحلة المشروع"
          value={values.projectStage}
          options={PROJECT_STAGE_OPTIONS}
          onChange={(projectStage) => update({ projectStage })}
        />
      );
    }

    if (currentStep === 'furnishing_goal') {
      return (
        <SelectField
          label="هدف التأثيث"
          value={values.furnishingGoal}
          options={FURNISHING_GOAL_OPTIONS}
          onChange={(furnishingGoal) => update({ furnishingGoal })}
        />
      );
    }

    if (currentStep === 'style_direction') {
      return (
        <SelectField
          label="اتجاه التصميم"
          value={values.styleDirection}
          options={STYLE_DIRECTION_OPTIONS}
          onChange={(styleDirection) => update({ styleDirection })}
        />
      );
    }

    if (currentStep === 'functional_priorities') {
      return (
        <textarea
          value={values.functionalPriorities}
          onChange={(e) => update({ functionalPriorities: e.target.value })}
          className="w-full min-h-[100px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="ما أهم الأولويات الوظيفية أو احتياجات الاستخدام؟"
        />
      );
    }

    if (currentStep === 'room_scope') {
      return (
        <textarea
          value={values.roomScope}
          onChange={(e) => update({ roomScope: e.target.value })}
          className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="ما الغرف أو المساحات المستهدفة؟"
        />
      );
    }

    if (currentStep === 'budget_range') {
      return (
        <SelectField
          label="فئة الميزانية"
          value={values.budgetRange}
          options={BUDGET_RANGE_OPTIONS}
          onChange={(budgetRange) => update({ budgetRange })}
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
            placeholder="متى تحتاج إنجاز التأثيث؟"
          />
          <SelectField
            label="الاستعجال (اختياري)"
            value={values.urgency}
            options={[
              { value: 'standard', label: 'عادي' },
              { value: 'soon', label: 'قريباً' },
              { value: 'urgent', label: 'عاجل' },
            ]}
            onChange={(urgency) => update({ urgency })}
          />
        </div>
      );
    }

    if (currentStep === 'procurement_preference') {
      return (
        <SelectField
          label="تفضيل التوريد"
          value={values.procurementPreference}
          options={PROCUREMENT_PREFERENCE_OPTIONS}
          onChange={(procurementPreference) => update({ procurementPreference })}
        />
      );
    }

    if (currentStep === 'readiness_context') {
      return (
        <textarea
          value={values.currentReadiness}
          onChange={(e) => update({ currentReadiness: e.target.value })}
          className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="ما الجاهزية الحالية للمساحة؟ (اختياري)"
        />
      );
    }

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>{values.functionalPriorities}</p>
          <p>النطاق: {values.roomScope}</p>
          <p>الهدف: {values.furnishingGoal}</p>
        </div>
      );
    }

    if (currentStep === 'readiness_brief' && brief) {
      return <PreliminaryBriefCard brief={brief} />;
    }

    if (currentStep === 'scope_confirm') {
      return (
        <label className="flex items-start gap-2 font-tajawal text-sm">
          <input
            type="checkbox"
            checked={values.scopeConfirmed}
            onChange={(e) => update({ scopeConfirmed: e.target.checked })}
          />
          <span>أؤكد أن المعلومات المقدمة صحيحة إلى أفضل علمي.</span>
        </label>
      );
    }

    if (currentStep === 'submit_confirm') {
      return (
        <div className="space-y-3 font-tajawal">
          <p className="text-sm text-gray-600 dark:text-white/70">
            تم تجهيز موجز جاهزية التأثيث. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة جاهزية التأثيث.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return <p className="font-tajawal text-green-700 dark:text-green-300">تم إرسال طلب التأثيث بنجاح.</p>;
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
