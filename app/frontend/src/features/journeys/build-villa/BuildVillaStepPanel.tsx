import { Loader2 } from 'lucide-react';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import type { BuildVillaContext } from './types';
import {
  BUDGET_RANGE_OPTIONS,
  DESIRED_SERVICE_OPTIONS,
  DESIRED_START_OPTIONS,
  DESIGN_STYLE_OPTIONS,
  EDITABLE_STEPS,
  LAND_OWNERSHIP_OPTIONS,
  SPACE_OPTIONS,
  STEP_DESCRIPTIONS,
  STEP_LABELS,
  getStepNumber,
  getTotalSteps,
} from './constants';
import { getErrorMessage, type BuildVillaStepValues } from './errors';
import type { FieldValidationErrorDetail } from './types';

export type { BuildVillaStepValues };

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
  onRevisit?: (targetStep: string) => void;
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
  onRevisit,
  compact = false,
}: BuildVillaStepPanelProps) {
  const stepProgress =
    !currentStep || currentStep === 'intake_complete' ? getTotalSteps() : getStepNumber(currentStep);

  const update = (patch: Partial<BuildVillaStepValues>) => {
    onChange({ ...values, ...patch });
  };

  const toggleSpace = (space: string) => {
    const selected = values.selectedSpaces.includes(space)
      ? values.selectedSpaces.filter((item) => item !== space)
      : [...values.selectedSpaces, space];
    update({ selectedSpaces: selected });
  };

  const renderSummaryReview = () => {
    const rows: { key: string; label: string; value: string }[] = [
      { key: 'project_intent', label: 'هدف المشروع', value: context.project_objective ?? '—' },
      { key: 'city', label: 'المدينة', value: context.city ?? '—' },
      {
        key: 'land_ownership',
        label: 'حالة الأرض',
        value: context.land_ownership_type ?? '—',
      },
      {
        key: 'land_area',
        label: 'مساحة الأرض',
        value: context.land_area_sqm != null ? `${context.land_area_sqm} م²` : '—',
      },
      {
        key: 'household_needs',
        label: 'احتياجات الأسرة',
        value: context.use_summary ?? (context.household_size != null ? `${context.household_size} أفراد` : '—'),
      },
      {
        key: 'space_program',
        label: 'برنامج المساحات',
        value:
          context.selected_spaces?.length
            ? context.selected_spaces.join('، ')
            : context.space_notes ?? '—',
      },
      { key: 'budget_context', label: 'الميزانية', value: context.budget_range ?? '—' },
      {
        key: 'timeline_context',
        label: 'الجدول الزمني',
        value: context.desired_start ?? '—',
      },
      { key: 'design_direction', label: 'التصميم', value: context.design_style ?? '—' },
      { key: 'desired_service', label: 'نطاق الخدمة', value: context.desired_service ?? '—' },
    ];

    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-gold/15 bg-white dark:bg-white/5 px-4 py-3 font-tajawal text-sm"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">{row.label}</p>
              <p className="text-gray-600 dark:text-white/70">{row.value}</p>
            </div>
            {onRevisit && EDITABLE_STEPS.includes(row.key as (typeof EDITABLE_STEPS)[number]) ? (
              <button
                type="button"
                onClick={() => onRevisit(row.key)}
                className="text-xs font-semibold text-gold hover:underline"
              >
                تعديل
              </button>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const renderStepFields = () => {
    if (!currentStep) {
      return null;
    }

    if (currentStep === 'project_intent') {
      return (
        <textarea
          value={values.projectObjective}
          onChange={(event) => update({ projectObjective: event.target.value })}
          rows={compact ? 3 : 4}
          className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          placeholder="مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف..."
        />
      );
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

    if (currentStep === 'household_needs') {
      return (
        <div className="space-y-3">
          <input
            type="number"
            min="1"
            value={values.householdSize}
            onChange={(event) => update({ householdSize: event.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="عدد أفراد الأسرة (اختياري)"
          />
          <textarea
            value={values.useSummary}
            onChange={(event) => update({ useSummary: event.target.value })}
            rows={3}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="صف احتياجات السكن والاستخدام..."
          />
        </div>
      );
    }

    if (currentStep === 'space_program') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="1"
              value={values.floors}
              onChange={(event) => update({ floors: event.target.value })}
              className="rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
              placeholder="عدد الأدوار"
            />
            <input
              type="number"
              min="1"
              value={values.bedrooms}
              onChange={(event) => update({ bedrooms: event.target.value })}
              className="rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
              placeholder="عدد غرف النوم"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SPACE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleSpace(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-tajawal border ${
                  values.selectedSpaces.includes(option.value)
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-gold/20 bg-white dark:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <textarea
            value={values.spaceNotes}
            onChange={(event) => update({ spaceNotes: event.target.value })}
            rows={2}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ملاحظات إضافية (اختياري)"
          />
        </div>
      );
    }

    if (currentStep === 'budget_context') {
      return (
        <div className="space-y-2">
          {BUDGET_RANGE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 cursor-pointer font-tajawal"
            >
              <input
                type="radio"
                name="budget_range"
                value={option.value}
                checked={values.budgetRange === option.value}
                onChange={(event) => update({ budgetRange: event.target.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (currentStep === 'timeline_context') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {DESIRED_START_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 cursor-pointer font-tajawal"
              >
                <input
                  type="radio"
                  name="desired_start"
                  value={option.value}
                  checked={values.desiredStart === option.value}
                  onChange={(event) => update({ desiredStart: event.target.value })}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <select
            value={values.urgency}
            onChange={(event) => update({ urgency: event.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
          >
            <option value="">درجة الأولوية (اختياري)</option>
            <option value="standard">عادي</option>
            <option value="soon">قريباً</option>
            <option value="urgent">عاجل</option>
          </select>
        </div>
      );
    }

    if (currentStep === 'design_direction') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {DESIGN_STYLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 cursor-pointer font-tajawal"
              >
                <input
                  type="radio"
                  name="design_style"
                  value={option.value}
                  checked={values.designStyle === option.value}
                  onChange={(event) => update({ designStyle: event.target.value })}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <textarea
            value={values.designNotes}
            onChange={(event) => update({ designNotes: event.target.value })}
            rows={2}
            className="w-full rounded-xl border border-gold/20 bg-white dark:bg-white/5 px-4 py-3 font-tajawal"
            placeholder="ملاحظات تصميم (اختياري)"
          />
        </div>
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

    if (currentStep === 'summary_review') {
      return renderSummaryReview();
    }

    if (currentStep === 'brief_review') {
      const brief = context.preliminary_brief ?? context.intake_draft?.preliminary_brief;
      if (brief) {
        return <PreliminaryBriefCard brief={brief} />;
      }
      return (
        <p className="font-tajawal text-sm text-gray-600 dark:text-white/70">
          جاري تجهيز الموجز الأولي...
        </p>
      );
    }

    if (currentStep === 'scope_confirm') {
      return (
        <label className="flex items-start gap-2 font-tajawal cursor-pointer">
          <input
            type="checkbox"
            checked={values.scopeConfirmed}
            onChange={(event) => update({ scopeConfirmed: event.target.checked })}
            className="mt-1"
          />
          <span>أؤكد أن المعلومات والموجز الأولي صحيحة ضمن نطاق الاستكشاف.</span>
        </label>
      );
    }

    if (currentStep === 'submit_confirm') {
      return (
        <label className="flex items-start gap-2 font-tajawal cursor-pointer">
          <input
            type="checkbox"
            checked={values.submitConfirmed}
            onChange={(event) => update({ submitConfirmed: event.target.checked })}
            className="mt-1"
          />
          <span>أؤكد رغبتي في إرسال الطلب لمراجعة EAM المهنية.</span>
        </label>
      );
    }

    if (currentStep === 'intake_complete') {
      const brief = context.preliminary_brief ?? context.intake_draft?.preliminary_brief;
      if (brief) {
        return <PreliminaryBriefCard brief={brief} />;
      }
      const draft = context.intake_draft;
      return (
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4 font-tajawal text-sm">
          <p><strong>المدينة:</strong> {draft?.city ?? context.city}</p>
          <p><strong>حالة الأرض:</strong> {draft?.land_ownership_type ?? context.land_ownership_type}</p>
          <p><strong>المساحة:</strong> {draft?.land_area_sqm ?? context.land_area_sqm} م²</p>
          <p><strong>الخدمة:</strong> {draft?.desired_service ?? context.desired_service}</p>
        </div>
      );
    }

    return null;
  };

  const continueLabel =
    currentStep === 'documents_context' || currentStep === 'summary_review'
      ? 'متابعة'
      : currentStep === 'brief_review'
        ? 'تأكيد الموجز والمتابعة'
        : 'متابعة';

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
          {continueLabel}
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
