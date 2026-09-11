import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  DOCUMENTS_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  STEP_LABELS,
  URGENCY_OPTIONS,
} from './constants';
import {
  getErrorMessage,
  type FieldValidationErrorDetail,
  type GovernmentServicesStepValues,
} from './errors';
import type { GovernmentServicesContext } from './types';

interface Props {
  currentStep: string | null;
  context: GovernmentServicesContext;
  values: GovernmentServicesStepValues;
  onChange: (values: GovernmentServicesStepValues) => void;
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

export default function GovernmentServicesStepPanel({
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
  const update = (patch: Partial<GovernmentServicesStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'service_category') {
      return (
        <SelectField
          label="ما نوع الخدمة الحكومية المطلوبة؟"
          value={values.serviceCategory}
          options={SERVICE_CATEGORY_OPTIONS}
          onChange={(serviceCategory) => update({ serviceCategory })}
        />
      );
    }

    if (currentStep === 'property_location') {
      return (
        <input
          type="text"
          value={values.propertyLocation}
          onChange={(e) => update({ propertyLocation: e.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="أين يقع العقار؟ (المدينة/الحي)"
        />
      );
    }

    if (currentStep === 'property_type') {
      return (
        <SelectField
          label="نوع العقار"
          value={values.propertyType}
          options={PROPERTY_TYPE_OPTIONS}
          onChange={(propertyType) => update({ propertyType })}
        />
      );
    }

    if (currentStep === 'request_summary') {
      return (
        <textarea
          value={values.requestSummary}
          onChange={(e) => update({ requestSummary: e.target.value })}
          className="min-h-[120px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="صف طلبك باختصار — ما الذي تحتاج إنجازه؟"
        />
      );
    }

    if (currentStep === 'documents_status') {
      return (
        <SelectField
          label="ما حالة المستندات المتاحة؟"
          value={values.documentsStatus}
          options={DOCUMENTS_STATUS_OPTIONS}
          onChange={(documentsStatus) => update({ documentsStatus })}
        />
      );
    }

    if (currentStep === 'urgency_context') {
      return (
        <SelectField
          label="ما مستوى الأولوية؟"
          value={values.urgency}
          options={URGENCY_OPTIONS}
          onChange={(urgency) => update({ urgency })}
        />
      );
    }

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>راجع ملخص طلبك قبل عرض خارطة المهام الأولية.</p>
          <ul className="list-disc pr-5">
            <li>الخدمة: {values.serviceCategory || '—'}</li>
            <li>الموقع: {values.propertyLocation || '—'}</li>
            <li>نوع العقار: {values.propertyType || '—'}</li>
          </ul>
        </div>
      );
    }

    if (currentStep === 'task_roadmap_brief' && brief) {
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
          <span>أؤكد أن المعلومات المقدّمة دقيقة على قدر علمي — هذه خارطة أولية وليست استنتاجاً نظامياً.</span>
        </label>
      );
    }

    if (currentStep === 'submit_confirm') {
      return (
        <label className="flex items-start gap-3 font-tajawal text-sm">
          <input
            type="checkbox"
            checked={values.submitConfirmed}
            onChange={(e) => update({ submitConfirmed: e.target.checked })}
            className="mt-1"
          />
          <span>أؤكد رغبتي في إرسال الطلب للمراجعة المهنية.</span>
        </label>
      );
    }

    return null;
  };

  if (isCompleted || isTerminal) {
    return (
      <div className="rounded-xl border border-gold/20 bg-white/70 p-6 dark:bg-white/5">
        <p className="font-tajawal text-sm text-gray-700 dark:text-white/80">
          {isCompleted ? 'تم إرسال طلب الخدمة الحكومية للمراجعة المهنية.' : 'اكتملت خطوات الاستلام.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentStep ? (
        <h2 className="font-tajawal text-lg font-bold text-gray-900 dark:text-white">
          {STEP_LABELS[currentStep] ?? currentStep}
        </h2>
      ) : null}
      {renderFields()}
      {formError ? <p className="font-tajawal text-sm text-red-600">{formError}</p> : null}
      {fieldErrors.map((err) => (
        <p key={`${err.field}-${err.code}`} className="font-tajawal text-sm text-red-600">
          {err.message}
        </p>
      ))}
      <div className="flex gap-3">
        {currentStep === 'submit_confirm' ? (
          <button
            type="button"
            onClick={onComplete}
            disabled={isLoading || !values.submitConfirmed}
            className="rounded-xl bg-gold px-6 py-2 font-tajawal text-sm font-bold text-white disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'إرسال للمراجعة المهنية'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvance}
            disabled={isLoading}
            className="rounded-xl bg-gold px-6 py-2 font-tajawal text-sm font-bold text-white disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'متابعة'}
          </button>
        )}
      </div>
    </div>
  );
}
