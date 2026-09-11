import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  BUDGET_STATE_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  SCOPE_CLARITY_OPTIONS,
  STEP_LABELS,
} from './constants';
import { getErrorMessage, type FieldValidationErrorDetail, type ProjectManagementStepValues } from './errors';
import type { ProjectManagementContext } from './types';

interface Props {
  currentStep: string | null;
  context: ProjectManagementContext;
  values: ProjectManagementStepValues;
  onChange: (values: ProjectManagementStepValues) => void;
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

export default function ProjectManagementStepPanel({
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
  const update = (patch: Partial<ProjectManagementStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'project_type') {
      return (
        <SelectField
          label="نوع المشروع"
          value={values.projectType}
          options={PROJECT_TYPE_OPTIONS}
          onChange={(projectType) => update({ projectType })}
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

    if (currentStep === 'project_context') {
      return (
        <div className="space-y-3">
          <textarea
            value={values.projectObjective}
            onChange={(e) => update({ projectObjective: e.target.value })}
            className="w-full min-h-[100px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ما الهدف الأساسي من المشروع؟"
          />
          <textarea
            value={values.currentStatus}
            onChange={(e) => update({ currentStatus: e.target.value })}
            className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ما الوضع الحالي للمشروع؟"
          />
        </div>
      );
    }

    if (currentStep === 'scope_clarity') {
      return (
        <SelectField
          label="وضوح النطاق"
          value={values.scopeClarity}
          options={SCOPE_CLARITY_OPTIONS}
          onChange={(scopeClarity) => update({ scopeClarity })}
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
            placeholder="متى تحتاج الدعم أو النتيجة؟"
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
          label="إطار الميزانية"
          value={values.budgetState}
          options={BUDGET_STATE_OPTIONS}
          onChange={(budgetState) => update({ budgetState })}
        />
      );
    }

    if (currentStep === 'challenges_context') {
      return (
        <div className="space-y-3">
          <textarea
            value={values.mainChallenges}
            onChange={(e) => update({ mainChallenges: e.target.value })}
            className="w-full min-h-[100px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ما أبرز التحديات أو العقبات؟"
          />
          <textarea
            value={values.topRisks}
            onChange={(e) => update({ topRisks: e.target.value })}
            className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="مخاطر أو إشارات تعثر (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'stakeholder_context') {
      return (
        <textarea
          value={values.stakeholderNotes}
          onChange={(e) => update({ stakeholderNotes: e.target.value })}
          className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="ملاحظات عن أصحاب المصلحة أو التنسيق (اختياري)"
        />
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
          <p>{values.projectObjective}</p>
          <p>المرحلة: {values.projectStage}</p>
          <p>الوضع: {values.currentStatus}</p>
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
            تم تجهيز موجز جاهزية إدارة المشروع. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
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
          تم إكمال رحلة جاهزية إدارة المشروع.
        </p>
      );
    }

    return null;
  };

  if (isCompleted) {
    return <p className="font-tajawal text-green-700 dark:text-green-300">تم إرسال طلب إدارة المشروع بنجاح.</p>;
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
