import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  ACCESS_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  MAINTENANCE_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  STEP_LABELS,
} from './constants';
import { getErrorMessage, type FieldValidationErrorDetail, type MaintenanceStepValues } from './errors';
import type { SmartMaintenanceContext } from './types';

interface Props {
  currentStep: string | null;
  context: SmartMaintenanceContext;
  values: MaintenanceStepValues;
  onChange: (values: MaintenanceStepValues) => void;
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

export default function MaintenanceStepPanel({
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
  const update = (patch: Partial<MaintenanceStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'maintenance_category') {
      return (
        <SelectField
          label="نوع الصيانة"
          value={values.maintenanceCategory}
          options={MAINTENANCE_CATEGORY_OPTIONS}
          onChange={(maintenanceCategory) => update({ maintenanceCategory })}
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
          placeholder="المدينة / الموقع / المبنى"
        />
      );
    }

    if (currentStep === 'issue_description') {
      return (
        <textarea
          value={values.issueDescription}
          onChange={(e) => update({ issueDescription: e.target.value })}
          className="w-full min-h-[120px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="صف المشكلة أو عطل الصيانة المطلوب..."
        />
      );
    }

    if (currentStep === 'severity_level') {
      return (
        <SelectField
          label="درجة الأولوية"
          value={values.severityLevel}
          options={SEVERITY_OPTIONS}
          onChange={(severityLevel) => update({ severityLevel })}
        />
      );
    }

    if (currentStep === 'access_readiness') {
      return (
        <SelectField
          label="جاهزية الوصول"
          value={values.accessReadiness}
          options={ACCESS_OPTIONS}
          onChange={(accessReadiness) => update({ accessReadiness })}
        />
      );
    }

    if (currentStep === 'system_context') {
      return (
        <textarea
          value={values.systemNotes}
          onChange={(e) => update({ systemNotes: e.target.value })}
          className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="نوع النظام / العمر / ملاحظات فنية (اختياري)"
        />
      );
    }

    if (currentStep === 'prior_service_context') {
      return (
        <div className="space-y-2 font-tajawal text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.priorMaintenance === true}
              onChange={(e) => update({ priorMaintenance: e.target.checked })}
            />
            <span>يوجد سجل صيانة سابق</span>
          </label>
          <textarea
            value={values.serviceNotes}
            onChange={(e) => update({ serviceNotes: e.target.value })}
            className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ملاحظات عن الصيانة السابقة (اختياري)"
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

    if (currentStep === 'timeline_context') {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={values.desiredTimeline}
            onChange={(e) => update({ desiredTimeline: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="متى تحتاج المعالجة؟"
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

    if (currentStep === 'summary_review') {
      return (
        <div className="space-y-2 font-tajawal text-sm text-gray-700 dark:text-white/80">
          <p>{values.issueDescription}</p>
          <p>الموقع: {values.location}</p>
          <p>النوع: {values.maintenanceCategory}</p>
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
            تم تجهيز موجز جاهزية الصيانة الذكية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة جاهزية الصيانة الذكية.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return <p className="font-tajawal text-green-700 dark:text-green-300">تم إرسال طلب الصيانة بنجاح.</p>;
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
