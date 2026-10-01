import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import {
  useJourneyStandardConfirmStep,
  isStandardConfirmStep,
} from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import {
  JourneyRadioGroup,
  JourneySelectField,
  JourneyTextArea,
  JourneyTextField,
} from '@/features/journeys/core/JourneyFieldControls';
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
  STEP_ORDER,
} from './constants';
import { type BuildVillaStepValues } from './errors';

export type { BuildVillaStepValues };

interface BuildVillaStepPanelProps
  extends JourneyStepPanelProps<BuildVillaStepValues, BuildVillaContext> {
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
  completedMessage,
  sectorId,
  compact = false,
}: BuildVillaStepPanelProps) {
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<BuildVillaStepValues>) => {
    onChange({ ...values, ...patch });
  };
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);

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
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-gold/15 bg-cream-light dark:bg-surface px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold text-ink">{row.label}</p>
              <p className="text-ink-secondary">{row.value}</p>
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

    if (isStandardConfirmStep(currentStep) && standardConfirm && currentStep !== 'intake_complete') {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'project_intent':
        return (
          <JourneyTextArea
            value={values.projectObjective}
            onChange={(projectObjective) => update({ projectObjective })}
            placeholder="مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف..."
            minHeight={compact ? '80px' : '120px'}
          />
        );
      case 'city':
        return (
          <JourneyTextField
            value={values.city}
            onChange={(city) => update({ city })}
            placeholder="مثال: الرياض"
          />
        );
      case 'land_ownership':
        return (
          <JourneyRadioGroup
            name="land_ownership_type"
            value={values.landOwnershipType}
            options={LAND_OWNERSHIP_OPTIONS}
            onChange={(landOwnershipType) => update({ landOwnershipType })}
          />
        );
      case 'land_area':
        return (
          <input
            type="number"
            min="1"
            value={values.landAreaSqm}
            onChange={(event) => update({ landAreaSqm: event.target.value })}
            className="w-full rounded-xl border border-gold/20 bg-cream-light dark:bg-surface px-4 py-3"
            placeholder="500"
          />
        );
      case 'household_needs':
        return (
          <div className="space-y-3">
            <input
              type="number"
              min="1"
              value={values.householdSize}
              onChange={(event) => update({ householdSize: event.target.value })}
              className="w-full rounded-xl border border-gold/20 bg-cream-light dark:bg-surface px-4 py-3"
              placeholder="عدد أفراد الأسرة (اختياري)"
            />
            <JourneyTextArea
              value={values.useSummary}
              onChange={(useSummary) => update({ useSummary })}
              placeholder="صف احتياجات السكن والاستخدام..."
              minHeight="80px"
            />
          </div>
        );
      case 'space_program':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="1"
                value={values.floors}
                onChange={(event) => update({ floors: event.target.value })}
                className="rounded-xl border border-gold/20 bg-cream-light dark:bg-surface px-4 py-3"
                placeholder="عدد الأدوار"
              />
              <input
                type="number"
                min="1"
                value={values.bedrooms}
                onChange={(event) => update({ bedrooms: event.target.value })}
                className="rounded-xl border border-gold/20 bg-cream-light dark:bg-surface px-4 py-3"
                placeholder="عدد غرف النوم"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SPACE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleSpace(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs border ${
                    values.selectedSpaces.includes(option.value)
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-gold/20 bg-cream-light dark:bg-surface'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <JourneyTextArea
              value={values.spaceNotes}
              onChange={(spaceNotes) => update({ spaceNotes })}
              placeholder="ملاحظات إضافية (اختياري)"
              minHeight="80px"
            />
          </div>
        );
      case 'budget_context':
        return (
          <JourneyRadioGroup
            name="budget_range"
            value={values.budgetRange}
            options={BUDGET_RANGE_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(budgetRange) => update({ budgetRange })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyRadioGroup
              name="desired_start"
              value={values.desiredStart}
              options={DESIRED_START_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(desiredStart) => update({ desiredStart })}
            />
            <JourneySelectField
              label="درجة الأولوية (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'design_direction':
        return (
          <div className="space-y-3">
            <JourneyRadioGroup
              name="design_style"
              value={values.designStyle}
              options={DESIGN_STYLE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(designStyle) => update({ designStyle })}
            />
            <JourneyTextArea
              value={values.designNotes}
              onChange={(designNotes) => update({ designNotes })}
              placeholder="ملاحظات تصميم (اختياري)"
              minHeight="80px"
            />
          </div>
        );
      case 'documents_context':
        return (
          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
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
            <JourneyTextArea
              value={values.documentNotes}
              onChange={(documentNotes) => update({ documentNotes })}
              placeholder="أي تفاصيل إضافية (اختياري)"
              minHeight={compact ? '80px' : '120px'}
            />
          </div>
        );
      case 'desired_service':
        return (
          <JourneyRadioGroup
            name="desired_service"
            value={values.desiredService}
            options={DESIRED_SERVICE_OPTIONS}
            onChange={(desiredService) => update({ desiredService })}
          />
        );
      case 'summary_review':
        return renderSummaryReview();
      case 'brief_review': {
        const brief = context.preliminary_brief ?? context.intake_draft?.preliminary_brief;
        if (brief) {
          return <PreliminaryBriefCard brief={brief} />;
        }
        return (
          <p className="text-sm text-ink-secondary">
            جاري تجهيز الموجز الأولي...
          </p>
        );
      }
      case 'intake_complete': {
        const brief = context.preliminary_brief ?? context.intake_draft?.preliminary_brief;
        if (brief) {
          return <PreliminaryBriefCard brief={brief} />;
        }
        const draft = context.intake_draft;
        return (
          <div className="space-y-2 rounded-xl border border-gold/20 bg-surface-alt dark:bg-surface p-4 text-sm">
            <p><strong>المدينة:</strong> {draft?.city ?? context.city}</p>
            <p><strong>حالة الأرض:</strong> {draft?.land_ownership_type ?? context.land_ownership_type}</p>
            <p><strong>المساحة:</strong> {draft?.land_area_sqm ?? context.land_area_sqm} م²</p>
            <p><strong>الخدمة:</strong> {draft?.desired_service ?? context.desired_service}</p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const advanceLabel =
    currentStep === 'brief_review' ? 'تأكيد الموجز والمتابعة' : undefined;

  return (
    <JourneyStepPanelShell
      currentStep={currentStep}
      stepLabels={STEP_LABELS}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      advanceLabel={advanceLabel}
      completeLabel="إنهاء الرحلة"
      stepOrder={STEP_ORDER}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
    >
      {currentStep && STEP_DESCRIPTIONS[currentStep] ? (
        <p className="text-sm text-ink-secondary">{STEP_DESCRIPTIONS[currentStep]}</p>
      ) : null}
      {renderStepFields()}
    </JourneyStepPanelShell>
  );
}
