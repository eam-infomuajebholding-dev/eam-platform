export interface ProjectManagementStepValues {
  projectType: string;
  projectStage: string;
  projectObjective: string;
  currentStatus: string;
  scopeClarity: string;
  desiredTimeline: string;
  urgency: string;
  budgetState: string;
  mainChallenges: string;
  topRisks: string;
  stakeholderNotes: string;
  engagementGoal: string;
  scopeConfirmed: boolean;
  submitConfirmed: boolean;
}

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { ProjectManagementContext } from './types';


export function buildAdvanceInput(
  currentStep: string | null,
  values: ProjectManagementStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'project_type':
      return { project_type: values.projectType };
    case 'project_stage':
      return { project_stage: values.projectStage };
    case 'project_context':
      return {
        project_objective: values.projectObjective,
        current_status: values.currentStatus,
      };
    case 'scope_clarity':
      return { scope_clarity: values.scopeClarity };
    case 'timeline_context':
      return {
        desired_timeline: values.desiredTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'budget_context':
      return { budget_state: values.budgetState };
    case 'challenges_context':
      return {
        main_challenges: values.mainChallenges,
        ...(values.topRisks.trim() ? { top_risks: values.topRisks } : {}),
      };
    case 'stakeholder_context':
      return values.stakeholderNotes.trim() ? { stakeholder_notes: values.stakeholderNotes } : {};
    case 'engagement_goal':
      return { engagement_goal: values.engagementGoal };
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}

export function emptyValues(): ProjectManagementStepValues {
  return {
    projectType: '',
    projectStage: '',
    projectObjective: '',
    currentStatus: '',
    scopeClarity: '',
    desiredTimeline: '',
    urgency: '',
    budgetState: '',
    mainChallenges: '',
    topRisks: '',
    stakeholderNotes: '',
    engagementGoal: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: ProjectManagementContext): ProjectManagementStepValues {
  return {
    projectType: context.project_type ?? '',
    projectStage: context.project_stage ?? '',
    projectObjective: context.project_objective ?? '',
    currentStatus: context.current_status ?? '',
    scopeClarity: context.scope_clarity ?? '',
    desiredTimeline: context.desired_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetState: context.budget_state ?? '',
    mainChallenges: context.main_challenges ?? '',
    topRisks: context.top_risks ?? '',
    stakeholderNotes: context.stakeholder_notes ?? '',
    engagementGoal: context.engagement_goal ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
