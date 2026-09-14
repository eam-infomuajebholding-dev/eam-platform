export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { ContractingContext } from './types';


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

export function emptyValues(): ContractingStepValues {
  return {
    projectType: '',
    projectDescription: '',
    currentStage: '',
    location: '',
    designReadiness: '',
    boqReadiness: '',
    siteReadiness: '',
    scopeType: '',
    procurementGoal: '',
    desiredStart: '',
    urgency: '',
    budgetRange: '',
    requirementsNotes: '',
    experienceType: '',
    drawingsAvailable: null,
    boqAvailable: null,
    permitsAvailable: null,
    sitePhotosAvailable: null,
    documentNotes: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: ContractingContext): ContractingStepValues {
  return {
    projectType: context.project_type ?? '',
    projectDescription: context.project_description ?? '',
    currentStage: context.current_stage ?? '',
    location: context.location ?? '',
    designReadiness: context.design_readiness ?? '',
    boqReadiness: context.boq_readiness ?? '',
    siteReadiness: context.site_readiness ?? '',
    scopeType: context.scope_type ?? '',
    procurementGoal: context.procurement_goal ?? '',
    desiredStart: context.desired_start ?? '',
    urgency: context.urgency ?? '',
    budgetRange: context.budget_range ?? '',
    requirementsNotes: context.requirements_notes ?? '',
    experienceType: context.experience_type ?? '',
    drawingsAvailable: context.drawings_available ?? null,
    boqAvailable: context.boq_available ?? null,
    permitsAvailable: context.permits_available ?? null,
    sitePhotosAvailable: context.site_photos_available ?? null,
    documentNotes: context.document_notes ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
