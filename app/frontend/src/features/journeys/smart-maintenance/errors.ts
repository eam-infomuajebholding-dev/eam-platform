import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface MaintenanceStepValues {
  maintenanceCategory: string;
  location: string;
  issueDescription: string;
  severityLevel: string;
  accessReadiness: string;
  systemNotes: string;
  priorMaintenance: boolean | null;
  serviceNotes: string;
  engagementGoal: string;
  desiredTimeline: string;
  urgency: string;
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
  values: MaintenanceStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'maintenance_category':
      return { maintenance_category: values.maintenanceCategory };
    case 'asset_location':
      return { location: values.location };
    case 'issue_description':
      return { issue_description: values.issueDescription };
    case 'severity_level':
      return { severity_level: values.severityLevel };
    case 'access_readiness':
      return { access_readiness: values.accessReadiness };
    case 'system_context':
      return values.systemNotes.trim() ? { system_notes: values.systemNotes } : {};
    case 'prior_service_context':
      return {
        ...(values.priorMaintenance != null ? { prior_maintenance: values.priorMaintenance } : {}),
        ...(values.serviceNotes.trim() ? { service_notes: values.serviceNotes } : {}),
      };
    case 'engagement_goal':
      return { engagement_goal: values.engagementGoal };
    case 'timeline_context':
      return {
        desired_timeline: values.desiredTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
