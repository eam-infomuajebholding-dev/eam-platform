import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  ASSET_CONTEXT_OPTIONS,
  CURRENT_STATUS_OPTIONS,
  DOCUMENTS_READINESS_OPTIONS,
  INTENDED_USE_OPTIONS,
  STEP_LABELS,
  URGENCY_OPTIONS,
} from './constants';
import {
  getErrorMessage,
  type FieldValidationErrorDetail,
  type RealEstateDevelopmentStepValues,
} from './errors';
import type { RealEstateDevelopmentContext } from './types';

interface Props {
  currentStep: string | null;
  context: RealEstateDevelopmentContext;
  values: RealEstateDevelopmentStepValues;
  onChange: (values: RealEstateDevelopmentStepValues) => void;
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
}: Props) {
  const update = (patch: Partial<RealEstateDevelopmentStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'asset_context') {
      return (
        <SelectField
          label="ما سياق الأصل أو الفرصة؟"
          value={values.assetContext}
          options={ASSET_CONTEXT_OPTIONS}
          onChange={(assetContext) => update({ assetContext })}
        />
      );
    }

    if (currentStep === 'asset_location') {
      return (
        <input
          type="text"
          value={values.assetLocation}
          onChange={(e) => update({ assetLocation: e.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="أين يقع الأصل؟ (المدينة/الحي)"
        />
      );
    }

    if (currentStep === 'development_objective') {
      return (
        <textarea
          value={values.developmentObjective}
          onChange={(e) => update({ developmentObjective: e.target.value })}
          className="min-h-[120px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="صف هدفك التطويري — ما الذي تريد تحقيقه؟"
        />
      );
    }

    if (currentStep === 'intended_use') {
      return (
        <SelectField
          label="الاستخدام المستهدف"
          value={values.intendedUse}
          options={INTENDED_USE_OPTIONS}
          onChange={(intendedUse) => update({ intendedUse })}
        />
      );
    }

    if (currentStep === 'current_status') {
      return (
        <SelectField
          label="الحالة الحالية للأصل"
          value={values.currentStatus}
          options={CURRENT_STATUS_OPTIONS}
          onChange={(currentStatus) => update({ currentStatus })}
        />
      );
    }

    if (currentStep === 'constraints_context') {
      return (
        <textarea
          value={values.knownConstraints}
          onChange={(e) => update({ knownConstraints: e.target.value })}
          className="min-h-[80px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="قيود معروفة (تنظيمية/مالية/زمنية) إن وجدت — اختياري"
        />
      );
    }

    if (currentStep === 'documents_readiness') {
      return (
        <SelectField
          label="ما حالة المستندات المتاحة؟"
          value={values.documentsReadiness}
          options={DOCUMENTS_READINESS_OPTIONS}
          onChange={(documentsReadiness) => update({ documentsReadiness })}
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
            placeholder="متى تحتاج البدء أو اتخاذ القرار؟"
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

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>راجع ملخص فرصتك قبل عرض اللقطة الأولية.</p>
          <ul className="list-disc pr-5">
            <li>الموقع: {values.assetLocation || '—'}</li>
            <li>الهدف: {values.developmentObjective || '—'}</li>
            <li>الاستخدام: {values.intendedUse || '—'}</li>
          </ul>
        </div>
      );
    }

    if (currentStep === 'opportunity_snapshot_brief' && brief) {
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
            أؤكد أن المعلومات المقدّمة دقيقة على قدر علمي — هذه لقطة أولية وليست دراسة جدوى أو تقييماً.
          </span>
        </label>
      );
    }

    if (currentStep === 'submit_confirm') {
      return (
        <div className="space-y-3 font-tajawal">
          <p className="text-sm text-gray-600 dark:text-white/70">
            تم تجهيز لقطة فرصة التطوير الأولية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة التطوير العقاري.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return (
      <p className="font-tajawal text-green-700 dark:text-green-300">
        تم إرسال طلب التطوير العقاري بنجاح.
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
