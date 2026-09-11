import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  ENGAGEMENT_TYPE_OPTIONS,
  EQUIPMENT_CATEGORY_OPTIONS,
  EQUIPMENT_NEED_OPTIONS,
  STEP_LABELS,
  URGENCY_OPTIONS,
} from './constants';
import {
  getErrorMessage,
  type FieldValidationErrorDetail,
  type EquipmentStepValues,
} from './errors';
import type { EquipmentContext } from './types';

interface Props {
  currentStep: string | null;
  context: EquipmentContext;
  values: EquipmentStepValues;
  onChange: (values: EquipmentStepValues) => void;
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
}: Props) {
  const update = (patch: Partial<EquipmentStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'equipment_need') {
      return (
        <SelectField
          label="ما حاجتك من المعدات؟"
          value={values.equipmentNeed}
          options={EQUIPMENT_NEED_OPTIONS}
          onChange={(equipmentNeed) => update({ equipmentNeed })}
        />
      );
    }

    if (currentStep === 'equipment_category') {
      return (
        <SelectField
          label="ما فئة المعدات المطلوبة؟"
          value={values.equipmentCategory}
          options={EQUIPMENT_CATEGORY_OPTIONS}
          onChange={(equipmentCategory) => update({ equipmentCategory })}
        />
      );
    }

    if (currentStep === 'usage_context') {
      return (
        <textarea
          value={values.usageContext}
          onChange={(e) => update({ usageContext: e.target.value })}
          className="min-h-[120px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="صف سياق الاستخدام أو المشروع الذي تحتاج المعدات له..."
        />
      );
    }

    if (currentStep === 'location') {
      return (
        <input
          type="text"
          value={values.location}
          onChange={(e) => update({ location: e.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="أين موقع التشغيل؟ (المدينة/الموقع)"
        />
      );
    }

    if (currentStep === 'engagement_type') {
      return (
        <SelectField
          label="ما نوع التعاقد المطلوب؟"
          value={values.engagementType}
          options={ENGAGEMENT_TYPE_OPTIONS}
          onChange={(engagementType) => update({ engagementType })}
        />
      );
    }

    if (currentStep === 'specifications_context') {
      return (
        <textarea
          value={values.specificationsContext}
          onChange={(e) => update({ specificationsContext: e.target.value })}
          className="min-h-[80px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="مواصفات أو قدرة أو موديل المعدات — اختياري"
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
            placeholder="متى تحتاج المعدات أو اتخاذ القرار؟"
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

    if (currentStep === 'readiness_context') {
      return (
        <textarea
          value={values.readinessContext}
          onChange={(e) => update({ readinessContext: e.target.value })}
          className="min-h-[80px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="جاهزية الموقع أو التشغيل إن وُجدت — اختياري"
        />
      );
    }

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>راجع ملخص طلبك قبل عرض موجز الجاهزية الأولي.</p>
          <ul className="list-disc pr-5">
            <li>الموقع: {values.location || '—'}</li>
            <li>الاستخدام: {values.usageContext || '—'}</li>
            <li>الفئة: {values.equipmentCategory || '—'}</li>
          </ul>
        </div>
      );
    }

    if (currentStep === 'equipment_readiness_brief' && brief) {
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
            تم تجهيز موجز جاهزية المعدات والآلات الأولي. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة المعدات والآلات.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return (
      <p className="font-tajawal text-green-700 dark:text-green-300">
        تم إرسال طلب المعدات والآلات بنجاح.
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
