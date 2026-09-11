import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

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

export function extractFieldErrors(error: unknown): FieldValidationErrorDetail[] {
  if (!error || typeof error !== 'object') return [];
  const maybeResponse = error as {
    response?: { data?: { detail?: { errors?: FieldValidationErrorDetail[] } | string } };
    data?: { detail?: { errors?: FieldValidationErrorDetail[] } | string };
    detail?: { errors?: FieldValidationErrorDetail[] } | string;
  };
  const detail =
    maybeResponse.response?.data?.detail ?? maybeResponse.data?.detail ?? maybeResponse.detail;
  if (detail && typeof detail === 'object' && Array.isArray(detail.errors)) {
    return detail.errors;
  }
  return [];
}

export function getErrorMessage(errors: FieldValidationErrorDetail[], fallback: string): string {
  if (errors.length > 0) return errors.map((item) => item.message).join(' ');
  return fallback;
}

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
