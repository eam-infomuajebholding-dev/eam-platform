import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  ASSET_TYPE_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  INSPECTION_OPTIONS,
  OWNERSHIP_OPTIONS,
  STEP_LABELS,
  VALUATION_PURPOSE_OPTIONS,
} from './constants';
import { getErrorMessage, type FieldValidationErrorDetail, type ValuationStepValues } from './errors';
import type { RealEstateValuationContext } from './types';

interface Props {
  currentStep: string | null;
  context: RealEstateValuationContext;
  values: ValuationStepValues;
  onChange: (values: ValuationStepValues) => void;
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
}: Props) {
  const update = (patch: Partial<ValuationStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'valuation_purpose') {
      return (
        <SelectField
          label="غرض التقييم"
          value={values.valuationPurpose}
          options={VALUATION_PURPOSE_OPTIONS}
          onChange={(valuationPurpose) => update({ valuationPurpose })}
        />
      );
    }

    if (currentStep === 'asset_type') {
      return (
        <SelectField
          label="نوع الأصل"
          value={values.assetType}
          options={ASSET_TYPE_OPTIONS}
          onChange={(assetType) => update({ assetType })}
        />
      );
    }

    if (currentStep === 'asset_location') {
      return (
        <input
          type="text"
          value={values.location}
          onChange={(e) => update({ location: e.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="المدينة / الموقع"
        />
      );
    }

    if (currentStep === 'asset_description') {
      return (
        <div className="space-y-3">
          <textarea
            value={values.assetDescription}
            onChange={(e) => update({ assetDescription: e.target.value })}
            className="w-full min-h-[120px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="صف العقار واستخدامه والحالة العامة..."
          />
          <input
            type="text"
            value={values.areaSqm}
            onChange={(e) => update({ areaSqm: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="المساحة بالم² (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'ownership_context') {
      return (
        <SelectField
          label="سياق الملكية"
          value={values.ownershipStatus}
          options={OWNERSHIP_OPTIONS}
          onChange={(ownershipStatus) => update({ ownershipStatus })}
        />
      );
    }

    if (currentStep === 'document_readiness') {
      return (
        <div className="space-y-2 font-tajawal text-sm">
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
          <textarea
            value={values.documentNotes}
            onChange={(e) => update({ documentNotes: e.target.value })}
            className="mt-2 w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ملاحظات المستندات (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'inspection_readiness') {
      return (
        <SelectField
          label="جاهزية المعاينة"
          value={values.inspectionReadiness}
          options={INSPECTION_OPTIONS}
          onChange={(inspectionReadiness) => update({ inspectionReadiness })}
        />
      );
    }

    if (currentStep === 'timeline_context') {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={values.desiredTimeline}
            onChange={(e) => update({ desiredTimeline: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="متى تحتاج التقييم؟"
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

    if (currentStep === 'engagement_goal') {
      return (
        <SelectField
          label="هدف الخدمة"
          value={values.engagementGoal}
          options={ENGAGEMENT_GOAL_OPTIONS}
          onChange={(engagementGoal) => update({ engagementGoal })}
        />
      );
    }

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>{values.assetDescription}</p>
          <p>الموقع: {values.location}</p>
          <p>الغرض: {values.valuationPurpose}</p>
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
            تم تجهيز موجز جاهزية التقييم العقاري. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة جاهزية التقييم العقاري.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return <p className="font-tajawal text-green-700 dark:text-green-300">تم إرسال طلب التقييم العقاري بنجاح.</p>;
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
