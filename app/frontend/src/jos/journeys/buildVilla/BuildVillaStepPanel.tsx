import { Loader2 } from 'lucide-react';
import type { BuildVillaContext } from './types';
import {
  DESIRED_SERVICE_OPTIONS,
  LAND_OWNERSHIP_OPTIONS,
  STEP_DESCRIPTIONS,
  STEP_LABELS,
  getStepNumber,
  getTotalSteps,
} from './constants';
import { getErrorMessage, type FieldValidationErrorDetail } from './errors';

export interface BuildVillaStepValues {
  city: string;
  landOwnershipType: string;
  landAreaSqm: string;
  hasDocuments: boolean | null;
  documentNotes: string;
  desiredService: string;
}

interface BuildVillaStepPanelProps {
  currentStep: string | null;
  context: BuildVillaContext;
  values: BuildVillaStepValues;
  onChange: (values: BuildVillaStepValues) => void;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  onAdvance: () => void;
  onComplete: () => void;
  compact?: boolean;
}

export default function BuildVillaStepPanel({
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
  compact = false,
}: BuildVillaStepPanelProps) {
  const stepProgress =
    !currentStep || currentStep === 'intake_complete' ? getTotalSteps() : getStepNumber(currentStep);

  const update = (patch: Partial<BuildVillaStepValues>) => {
    onChange({ ...values, ...patch });
  };

  const renderStepFields = () => {
    if (!currentStep) {
      return null;
    }

    if (currentStep === 'city') {
      return (
        <input
          type="text"
          value={values.city}
          onChange={(event) => update({ city: event.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="مثال: الرياض"
        />
      );
    }

    if (currentStep === 'land_ownership') {
      return (
        <div className="space-y-2">
          {LAND_OWNERSHIP_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 cursor-pointer font-tajawal"
            >
              <input
                type="radio"
                name="land_ownership_type"
                value={option.value}
                checked={values.landOwnershipType === option.value}
                onChange={(event) => update({ landOwnershipType: event.target.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (currentStep === 'land_area') {
      return (
        <input
          type="number"
          min="1"
          value={values.landAreaSqm}
          onChange={(event) => update({ landAreaSqm: event.target.value })}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="500"
        />
      );
    }

    if (currentStep === 'documents_context') {
      return (
        <div className="space-y-3">
          <div className="flex gap-4 font-tajawal text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="has_documents"
                checked={values.hasDocuments === true}
                onChange={() => update({ hasDocuments: true })}
              />
              نعم
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="has_documents"
                checked={values.hasDocuments === false}
                onChange={() => update({ hasDocuments: false })}
              />
              لا
            </label>
          </div>
          <textarea
            value={values.documentNotes}
            onChange={(event) => update({ documentNotes: event.target.value })}
            rows={compact ? 3 : 4}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="أي تفاصيل إضافية (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'desired_service') {
      return (
        <div className="space-y-2">
          {DESIRED_SERVICE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 cursor-pointer font-tajawal"
            >
              <input
                type="radio"
                name="desired_service"
                value={option.value}
                checked={values.desiredService === option.value}
                onChange={(event) => update({ desiredService: event.target.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (currentStep === 'intake_complete') {
      const draft = context.intake_draft;
      return (
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4 font-tajawal text-sm">
          <p><strong>المدينة:</strong> {draft?.city ?? context.city}</p>
          <p><strong>حالة الأرض:</strong> {draft?.land_ownership_type ?? context.land_ownership_type}</p>
          <p><strong>المساحة:</strong> {draft?.land_area_sqm ?? context.land_area_sqm} م²</p>
          <p><strong>الخدمة:</strong> {draft?.desired_service ?? context.desired_service}</p>
          {draft?.document_notes ? <p><strong>ملاحظات:</strong> {draft.document_notes}</p> : null}
        </div>
      );
    }

    return null;
  };

  if (isCompleted) {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 dark:bg-green-950/20 px-4 py-3 font-tajawal text-sm text-green-800 dark:text-green-200">
        تم إكمال رحلة جمع المعلومات بنجاح.
      </div>
    );
  }

  if (!currentStep) {
    return null;
  }

  return (
    <div className="space-y-4 border-t border-gray-100 dark:border-white/10 pt-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-white/60 font-tajawal">
          <span>الخطوة {Math.min(stepProgress, getTotalSteps())} من {getTotalSteps()}</span>
        </div>
        <h3 className="text-base font-bold font-tajawal text-gray-900 dark:text-white">
          {STEP_LABELS[currentStep]}
        </h3>
        <p className="text-sm text-gray-600 dark:text-white/70 font-tajawal">
          {STEP_DESCRIPTIONS[currentStep]}
        </p>
      </div>

      {renderStepFields()}

      {formError ? (
        <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-red-700 dark:text-red-200 font-tajawal text-sm">
          {formError}
          {fieldErrors.length > 0 ? (
            <ul className="mt-2 list-disc ps-5">
              {fieldErrors.map((item) => (
                <li key={`${item.field}-${item.code}`}>{item.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!isTerminal ? (
        <button
          type="button"
          onClick={onAdvance}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-tajawal text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {currentStep === 'documents_context' ? 'متابعة (اختياري)' : 'متابعة'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-tajawal text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إنهاء الرحلة
        </button>
      )}
    </div>
  );
}

export { getErrorMessage };
