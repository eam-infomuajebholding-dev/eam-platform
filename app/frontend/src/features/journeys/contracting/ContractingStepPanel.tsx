import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import {
  useJourneyStandardConfirmStep,
  isStandardConfirmStep,
} from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import {
  JourneySelectField,
  JourneyTextArea,
  JourneyTextField,
} from '@/features/journeys/core/JourneyFieldControls';
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
  STEP_ORDER,
} from './constants';
import { type ContractingStepValues } from './errors';
import type { ContractingContext } from './types';

type Props = JourneyStepPanelProps<ContractingStepValues, ContractingContext>;

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
  onRevisit,
  completedMessage,
  sectorId,
}: Props) {
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<ContractingStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'project_context':
        return (
          <div className="space-y-3">
            <JourneySelectField
              label="نوع المشروع"
              value={values.projectType}
              options={PROJECT_TYPE_OPTIONS}
              onChange={(projectType) => update({ projectType })}
            />
            <JourneySelectField
              label="مرحلة المشروع"
              value={values.currentStage}
              options={STAGE_OPTIONS}
              onChange={(currentStage) => update({ currentStage })}
            />
            <JourneyTextArea
              value={values.projectDescription}
              onChange={(projectDescription) => update({ projectDescription })}
              placeholder="صف المشروع ومتطلبات التنفيذ..."
            />
          </div>
        );
      case 'project_location':
        return (
          <JourneyTextField
            value={values.location}
            onChange={(location) => update({ location })}
            placeholder="المدينة / الموقع"
          />
        );
      case 'design_readiness':
        return (
          <JourneySelectField
            label="جاهزية التصميم"
            value={values.designReadiness}
            options={DESIGN_READINESS_OPTIONS}
            onChange={(designReadiness) => update({ designReadiness })}
          />
        );
      case 'boq_readiness':
        return (
          <JourneySelectField
            label="جاهزية BOQ"
            value={values.boqReadiness}
            options={BOQ_READINESS_OPTIONS}
            onChange={(boqReadiness) => update({ boqReadiness })}
          />
        );
      case 'site_readiness':
        return (
          <JourneySelectField
            label="جاهزية الموقع"
            value={values.siteReadiness}
            options={SITE_READINESS_OPTIONS}
            onChange={(siteReadiness) => update({ siteReadiness })}
          />
        );
      case 'scope_type':
        return (
          <JourneySelectField
            label="نوع النطاق"
            value={values.scopeType}
            options={SCOPE_TYPE_OPTIONS}
            onChange={(scopeType) => update({ scopeType })}
          />
        );
      case 'procurement_goal':
        return (
          <JourneySelectField
            label="هدف الشراء/التنفيذ"
            value={values.procurementGoal}
            options={PROCUREMENT_GOAL_OPTIONS}
            onChange={(procurementGoal) => update({ procurementGoal })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.desiredStart}
              onChange={(desiredStart) => update({ desiredStart })}
              placeholder="متى ترغب بالبدء؟"
            />
            <JourneySelectField
              label="الاستعجال (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'budget_context':
        return (
          <JourneySelectField
            label="سياق الميزانية"
            value={values.budgetRange}
            options={BUDGET_OPTIONS}
            onChange={(budgetRange) => update({ budgetRange })}
          />
        );
      case 'contractor_requirements':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.experienceType}
              onChange={(experienceType) => update({ experienceType })}
              placeholder="نوع الخبرة المطلوبة (اختياري)"
            />
            <JourneyTextArea
              value={values.requirementsNotes}
              onChange={(requirementsNotes) => update({ requirementsNotes })}
              placeholder="متطلبات أو تفضيلات إضافية (اختياري)"
              minHeight="100px"
            />
          </div>
        );
      case 'documents_context':
        return (
          <div className="space-y-2 text-sm">
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
                  onChange={(e) =>
                    update({ [key]: e.target.checked } as Partial<ContractingStepValues>)
                  }
                />
                {label}
              </label>
            ))}
            <JourneyTextArea
              value={values.documentNotes}
              onChange={(documentNotes) => update({ documentNotes })}
              placeholder="ملاحظات المستندات (اختياري)"
              minHeight="80px"
            />
          </div>
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>{values.projectDescription}</p>
            <p>الموقع: {values.location}</p>
            <p>الهدف: {values.procurementGoal}</p>
          </div>
        );
      case 'readiness_brief':
        return brief ? <PreliminaryBriefCard brief={brief} /> : null;
      default:
        return null;
    }
  };

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
      stepOrder={STEP_ORDER}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
