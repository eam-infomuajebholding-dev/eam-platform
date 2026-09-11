import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export function extractFieldErrors(error: unknown): FieldValidationErrorDetail[] {
  if (!error || typeof error !== 'object') {
    return [];
  }
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
  if (errors.length > 0) {
    return errors.map((item) => item.message).join(' ');
  }
  return fallback;
}

export interface ContractingStepValues {
  projectType: string;
  projectDescription: string;
  currentStage: string;
  location: string;
  designReadiness: string;
  boqReadiness: string;
  siteReadiness: string;
  scopeType: string;
  procurementGoal: string;
  desiredStart: string;
  urgency: string;
  budgetRange: string;
  requirementsNotes: string;
  experienceType: string;
  drawingsAvailable: boolean | null;
  boqAvailable: boolean | null;
  permitsAvailable: boolean | null;
  sitePhotosAvailable: boolean | null;
  documentNotes: string;
  scopeConfirmed: boolean;
  submitConfirmed: boolean;
}

export function buildAdvanceInput(
  currentStep: string | null,
  values: ContractingStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'project_context':
      return {
        project_type: values.projectType,
        project_description: values.projectDescription,
        current_stage: values.currentStage,
      };
    case 'project_location':
      return { location: values.location };
    case 'design_readiness':
      return { design_readiness: values.designReadiness };
    case 'boq_readiness':
      return { boq_readiness: values.boqReadiness };
    case 'site_readiness':
      return { site_readiness: values.siteReadiness };
    case 'scope_type':
      return { scope_type: values.scopeType };
    case 'procurement_goal':
      return { procurement_goal: values.procurementGoal };
    case 'timeline_context':
      return {
        desired_start: values.desiredStart,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'budget_context':
      return { budget_range: values.budgetRange };
    case 'contractor_requirements':
      return {
        ...(values.requirementsNotes.trim() ? { requirements_notes: values.requirementsNotes } : {}),
        ...(values.experienceType.trim() ? { experience_type: values.experienceType } : {}),
      };
    case 'documents_context':
      return {
        ...(values.drawingsAvailable != null ? { drawings_available: values.drawingsAvailable } : {}),
        ...(values.boqAvailable != null ? { boq_available: values.boqAvailable } : {}),
        ...(values.permitsAvailable != null ? { permits_available: values.permitsAvailable } : {}),
        ...(values.sitePhotosAvailable != null ? { site_photos_available: values.sitePhotosAvailable } : {}),
        ...(values.documentNotes.trim() ? { document_notes: values.documentNotes } : {}),
      };
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
