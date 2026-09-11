import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import type { EngineeringConsultingContext } from './types';
import { DISCIPLINE_OPTIONS, PROJECT_TYPE_OPTIONS, STEP_LABELS, getStepNumber, getTotalSteps } from './constants';
import { getErrorMessage, type EngineeringStepValues, type FieldValidationErrorDetail } from './errors';

interface Props {
  currentStep: string | null;
  context: EngineeringConsultingContext;
  values: EngineeringStepValues;
  onChange: (values: EngineeringStepValues) => void;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  onAdvance: () => void;
  onComplete: () => void;
}

export default function EngineeringConsultingStepPanel({
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
  const stepProgress =
    !currentStep || currentStep === 'handoff_complete' ? getTotalSteps() : getStepNumber(currentStep);
  const update = (patch: Partial<EngineeringStepValues>) => onChange({ ...values, ...patch });
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (currentStep === 'intent') {
      return (
        <div className="space-y-3">
          <textarea
            value={values.problemStatement}
            onChange={(e) => update({ problemStatement: e.target.value })}
            className="w-full min-h-[120px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="صف المشكلة أو الاستشارة المطلوبة..."
          />
          <input
            type="text"
            value={values.desiredOutcome}
            onChange={(e) => update({ desiredOutcome: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="النتيجة المرجوة (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'discipline') {
      return (
        <div className="space-y-2">
          {DISCIPLINE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer font-tajawal">
              <input
                type="radio"
                name="discipline"
                checked={values.discipline === option.value}
                onChange={() => update({ discipline: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    if (currentStep === 'qualification') {
      return (
        <div className="space-y-3">
          <select
            value={values.projectType}
            onChange={(e) => update({ projectType: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          >
            <option value="">نوع المشروع</option>
            {PROJECT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={values.location}
            onChange={(e) => update({ location: e.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="الموقع"
          />
          <textarea
            value={values.objective}
            onChange={(e) => update({ objective: e.target.value })}
            className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="هدف المشروع"
          />
        </div>
      );
    }

    if (currentStep === 'documents') {
      return (
        <div className="space-y-3">
          <textarea
            value={values.documentNotes}
            onChange={(e) => update({ documentNotes: e.target.value })}
            className="w-full min-h-[80px] rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ملاحظات أو روابط للمستندات (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'brief_review' && brief) {
      return <PreliminaryBriefCard brief={brief} />;
    }

    if (currentStep === 'scope_confirm') {
      return (
        <label className="flex items-start gap-2 font-tajawal cursor-pointer">
          <input
            type="checkbox"
            checked={values.scopeConfirmed}
            onChange={(e) => update({ scopeConfirmed: e.target.checked })}
            className="mt-1"
          />
          <span>أؤكد أن المعلومات والموجز الأولي صحيحة ضمن نطاق الاستكشاف، وأرغب في إرسال طلب الاستشارة.</span>
        </label>
      );
    }

    if (currentStep === 'handoff_complete') {
      return (
        <p className="font-tajawal text-gray-700 dark:text-white/80">
          تم تجهيز طلب الاستشارة الهندسية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
        </p>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between text-sm font-tajawal text-gray-500">
        <span>
          الخطوة {stepProgress} من {getTotalSteps()}
        </span>
        {currentStep && <span>{STEP_LABELS[currentStep]}</span>}
      </div>

      {renderFields()}

      {fieldErrors.length > 0 && (
        <ul className="text-sm text-red-600 font-tajawal space-y-1">
          {fieldErrors.map((err) => (
            <li key={`${err.field}-${err.code}`}>{err.message}</li>
          ))}
        </ul>
      )}
      {formError && <p className="text-sm text-red-600 font-tajawal">{formError}</p>}

      {!isCompleted && currentStep && currentStep !== 'handoff_complete' && (
        <button
          type="button"
          onClick={onAdvance}
          disabled={isLoading}
          className="eam-btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          متابعة
        </button>
      )}

      {isTerminal && !isCompleted && (
        <button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="eam-btn-outline w-full flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إنهاء وإرسال الطلب
        </button>
      )}

      {isCompleted && (
        <p className="text-green-700 font-tajawal text-center">تم إرسال طلب الاستشارة بنجاح.</p>
      )}
    </div>
  );
}
