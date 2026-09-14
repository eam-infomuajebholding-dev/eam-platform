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
  BUDGET_STATE_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  SCOPE_CLARITY_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type ProjectManagementStepValues } from './errors';
import type { ProjectManagementContext } from './types';

type Props = JourneyStepPanelProps<ProjectManagementStepValues, ProjectManagementContext>;

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
  completedMessage,
  sectorId,
}: Props) {
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<ProjectManagementStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'project_type':
        return (
          <JourneySelectField
            label="نوع المشروع"
            value={values.projectType}
            options={PROJECT_TYPE_OPTIONS}
            onChange={(projectType) => update({ projectType })}
          />
        );
      case 'project_stage':
        return (
          <JourneySelectField
            label="مرحلة المشروع"
            value={values.projectStage}
            options={PROJECT_STAGE_OPTIONS}
            onChange={(projectStage) => update({ projectStage })}
          />
        );
      case 'project_context':
        return (
          <div className="space-y-3">
            <JourneyTextArea
              value={values.projectObjective}
              onChange={(projectObjective) => update({ projectObjective })}
              placeholder="ما الهدف الأساسي من المشروع؟"
              minHeight="100px"
            />
            <JourneyTextArea
              value={values.currentStatus}
              onChange={(currentStatus) => update({ currentStatus })}
              placeholder="ما الوضع الحالي للمشروع؟"
              minHeight="80px"
            />
          </div>
        );
      case 'scope_clarity':
        return (
          <JourneySelectField
            label="وضوح النطاق"
            value={values.scopeClarity}
            options={SCOPE_CLARITY_OPTIONS}
            onChange={(scopeClarity) => update({ scopeClarity })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.desiredTimeline}
              onChange={(desiredTimeline) => update({ desiredTimeline })}
              placeholder="متى تحتاج الدعم أو النتيجة؟"
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
            label="إطار الميزانية"
            value={values.budgetState}
            options={BUDGET_STATE_OPTIONS}
            onChange={(budgetState) => update({ budgetState })}
          />
        );
      case 'challenges_context':
        return (
          <div className="space-y-3">
            <JourneyTextArea
              value={values.mainChallenges}
              onChange={(mainChallenges) => update({ mainChallenges })}
              placeholder="ما أبرز التحديات أو العقبات؟"
              minHeight="100px"
            />
            <JourneyTextArea
              value={values.topRisks}
              onChange={(topRisks) => update({ topRisks })}
              placeholder="مخاطر أو إشارات تعثر (اختياري)"
              minHeight="80px"
            />
          </div>
        );
      case 'stakeholder_context':
        return (
          <JourneyTextArea
            value={values.stakeholderNotes}
            onChange={(stakeholderNotes) => update({ stakeholderNotes })}
            placeholder="ملاحظات عن أصحاب المصلحة أو التنسيق (اختياري)"
            minHeight="80px"
          />
        );
      case 'engagement_goal':
        return (
          <JourneySelectField
            label="هدف الخدمة"
            value={values.engagementGoal}
            options={ENGAGEMENT_GOAL_OPTIONS}
            onChange={(engagementGoal) => update({ engagementGoal })}
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>{values.projectObjective}</p>
            <p>المرحلة: {values.projectStage}</p>
            <p>الوضع: {values.currentStatus}</p>
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
      onAdvance={onAdvance}
      onComplete={onComplete}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
