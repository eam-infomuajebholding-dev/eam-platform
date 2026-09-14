export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { SmartMaintenanceContext } from './types';

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

export function emptyValues(): MaintenanceStepValues {
  return {
    maintenanceCategory: '',
    location: '',
    issueDescription: '',
    severityLevel: '',
    accessReadiness: '',
    systemNotes: '',
    priorMaintenance: null,
    serviceNotes: '',
    engagementGoal: '',
    desiredTimeline: '',
    urgency: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: SmartMaintenanceContext): MaintenanceStepValues {
  return {
    maintenanceCategory: context.maintenance_category ?? '',
    location: context.location ?? '',
    issueDescription: context.issue_description ?? '',
    severityLevel: context.severity_level ?? '',
    accessReadiness: context.access_readiness ?? '',
    systemNotes: context.system_notes ?? '',
    priorMaintenance: context.prior_maintenance ?? null,
    serviceNotes: context.service_notes ?? '',
    engagementGoal: context.engagement_goal ?? '',
    desiredTimeline: context.desired_timeline ?? '',
    urgency: context.urgency ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
