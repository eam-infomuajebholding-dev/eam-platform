import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  EXISTING_ASSETS_OPTIONS,
  MARKETING_GOAL_OPTIONS,
  MARKETING_STAGE_OPTIONS,
  STEP_LABELS,
  TARGET_AUDIENCE_OPTIONS,
  URGENCY_OPTIONS,
} from './constants';
import {
  getErrorMessage,
  type FieldValidationErrorDetail,
  type RealEstateMarketingStepValues,
} from './errors';
import type { RealEstateMarketingContext } from './types';

interface Props {
  currentStep: string | null;
  context: RealEstateMarketingContext;
  values: RealEstateMarketingStepValues;
  onChange: (values: RealEstateMarketingStepValues) => void;
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
}: Props) {
  const update = (patch: Partial<RealEstateMarketingStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'marketing_goal') {
      return (
        <SelectField
          label="ما هدفك التسويقي؟"
          value={values.marketingGoal}
          options={MARKETING_GOAL_OPTIONS}
          onChange={(marketingGoal) => update({ marketingGoal })}
        />
      );
    }

    if (currentStep === 'property_description') {
      return (
        <textarea
          value={values.propertyDescription}
          onChange={(e) => update({ propertyDescription: e.target.value })}
          className="min-h-[120px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="صف العقار أو المشروع الذي تريد تسويقه..."
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

    if (currentStep === 'target_audience') {
      return (
        <SelectField
          label="من هو الجمهور المستهدف؟"
          value={values.targetAudience}
          options={TARGET_AUDIENCE_OPTIONS}
          onChange={(targetAudience) => update({ targetAudience })}
        />
      );
    }

    if (currentStep === 'marketing_stage') {
      return (
        <SelectField
          label="في أي مرحلة تسويقية أنت؟"
          value={values.marketingStage}
          options={MARKETING_STAGE_OPTIONS}
          onChange={(marketingStage) => update({ marketingStage })}
        />
      );
    }

    if (currentStep === 'existing_assets') {
      return (
        <SelectField
          label="ما الأصول التسويقية المتوفرة لديك؟"
          value={values.existingAssets}
          options={EXISTING_ASSETS_OPTIONS}
          onChange={(existingAssets) => update({ existingAssets })}
        />
      );
    }

    if (currentStep === 'channels_context') {
      return (
        <textarea
          value={values.channelsInterest}
          onChange={(e) => update({ channelsInterest: e.target.value })}
          className="min-h-[80px] w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="قنوات أو اهتمامات تسويقية (منصات رقمية، وسيط، إعلانات...) — اختياري"
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
            placeholder="متى تحتاج بدء التسويق أو اتخاذ القرار؟"
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
          placeholder="نطاق ميزانية تسويقية تقريبي إن وُجد — اختياري"
        />
      );
    }

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>راجع ملخص طلبك قبل عرض موجز الجاهزية الأولي.</p>
          <ul className="list-disc pr-5">
            <li>الموقع: {values.propertyLocation || '—'}</li>
            <li>الوصف: {values.propertyDescription || '—'}</li>
            <li>الجمهور: {values.targetAudience || '—'}</li>
          </ul>
        </div>
      );
    }

    if (currentStep === 'marketing_readiness_brief' && brief) {
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
            أؤكد أن المعلومات المقدّمة دقيقة على قدر علمي — هذا موجز أولي وليس خطة حملة معتمدة.
          </span>
        </label>
      );
    }

    if (currentStep === 'submit_confirm') {
      return (
        <div className="space-y-3 font-tajawal">
          <p className="text-sm text-gray-600 dark:text-white/70">
            تم تجهيز موجز جاهزية التسويق العقاري الأولي. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة التسويق العقاري.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return (
      <p className="font-tajawal text-green-700 dark:text-green-300">
        تم إرسال طلب التسويق العقاري بنجاح.
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
