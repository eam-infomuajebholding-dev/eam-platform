import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  BOQ_READINESS_OPTIONS,
  BUDGET_OPTIONS,
  DESIGN_READINESS_OPTIONS,
  PROCUREMENT_GOAL_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  SCOPE_TYPE_OPTIONS,
  SITE_READINESS_OPTIONS,
  STAGE_OPTIONS,
  STEP_LABELS,
} from './constants';
import { getErrorMessage, type ContractingStepValues, type FieldValidationErrorDetail } from './errors';
import type { ContractingContext } from './types';

interface Props {
  currentStep: string | null;
  context: ContractingContext;
  values: ContractingStepValues;
  onChange: (values: ContractingStepValues) => void;
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

export default function ContractingStepPanel({
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
  const update = (patch: Partial<ContractingStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'project_context') {
      return (
        <div className="space-y-3">
          <SelectField
            label="نوع المشروع"
            value={values.projectType}
            options={PROJECT_TYPE_OPTIONS}
            onChange={(projectType) => update({ projectType })}
          />
          <SelectField
            label="مرحلة المشروع"
            value={values.currentStage}
            options={STAGE_OPTIONS}
            onChange={(currentStage) => update({ currentStage })}
          />
          <textarea
            value={values.projectDescription}
            onChange={(e) => update({ projectDescription: e.target.value })}
            className="w-full min-h-[120px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="صف المشروع ومتطلبات التنفيذ..."
          />
        </div>
      );
    }

    if (currentStep === 'project_location') {
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

    if (currentStep === 'design_readiness') {
      return (
        <SelectField
          label="جاهزية التصميم"
          value={values.designReadiness}
          options={DESIGN_READINESS_OPTIONS}
          onChange={(designReadiness) => update({ designReadiness })}
        />
      );
    }

    if (currentStep === 'boq_readiness') {
      return (
        <SelectField
          label="جاهزية BOQ"
          value={values.boqReadiness}
          options={BOQ_READINESS_OPTIONS}
          onChange={(boqReadiness) => update({ boqReadiness })}
        />
      );
    }

    if (currentStep === 'site_readiness') {
      return (
        <SelectField
          label="جاهزية الموقع"
          value={values.siteReadiness}
          options={SITE_READINESS_OPTIONS}
          onChange={(siteReadiness) => update({ siteReadiness })}
        />
      );
    }

    if (currentStep === 'scope_type') {
      return (
        <SelectField
          label="نوع النطاق"
          value={values.scopeType}
          options={SCOPE_TYPE_OPTIONS}
          onChange={(scopeType) => update({ scopeType })}
        />
      );
    }

    if (currentStep === 'procurement_goal') {
      return (
        <SelectField
          label="هدف الشراء/التنفيذ"
          value={values.procurementGoal}
          options={PROCUREMENT_GOAL_OPTIONS}
          onChange={(procurementGoal) => update({ procurementGoal })}
        />
      );
    }

    if (currentStep === 'timeline_context') {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={values.desiredStart}
            onChange={(e) => update({ desiredStart: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="متى ترغب بالبدء؟"
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

    if (currentStep === 'budget_context') {
      return (
        <SelectField
          label="سياق الميزانية"
          value={values.budgetRange}
          options={BUDGET_OPTIONS}
          onChange={(budgetRange) => update({ budgetRange })}
        />
      );
    }

    if (currentStep === 'contractor_requirements') {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={values.experienceType}
            onChange={(e) => update({ experienceType: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="نوع الخبرة المطلوبة (اختياري)"
          />
          <textarea
            value={values.requirementsNotes}
            onChange={(e) => update({ requirementsNotes: e.target.value })}
            className="w-full min-h-[100px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="متطلبات أو تفضيلات إضافية (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'documents_context') {
      return (
        <div className="space-y-2 font-tajawal text-sm">
          {[
            ['drawingsAvailable', 'مخططات متوفرة'],
            ['boqAvailable', 'BOQ متوفر'],
            ['permitsAvailable', 'تصاريح متوفرة'],
            ['sitePhotosAvailable', 'صور موقع متوفرة'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values[key as keyof ContractingStepValues] === true}
                onChange={(e) => update({ [key]: e.target.checked } as Partial<ContractingStepValues>)}
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

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>{values.projectDescription}</p>
          <p>الموقع: {values.location}</p>
          <p>الهدف: {values.procurementGoal}</p>
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
            تم تجهيز موجز جاهزية المقاولات. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة جاهزية المقاولات.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return <p className="font-tajawal text-green-700 dark:text-green-300">تم إرسال طلب المقاولات بنجاح.</p>;
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
