export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { EngineeringConsultingContext } from './types';


export interface EngineeringStepValues {
  problemStatement: string;
  desiredOutcome: string;
  discipline: string;
  projectType: string;
  location: string;
  objective: string;
  currentStage: string;
  urgency: string;
  hasDocuments: boolean | null;
  documentNotes: string;
  scopeConfirmed: boolean;
}

export function buildAdvanceInput(
  currentStep: string | null,
  values: EngineeringStepValues,
): Record<string, unknown> {
  if (currentStep === 'intent') {
    return {
      problem_statement: values.problemStatement,
      ...(values.desiredOutcome.trim() ? { desired_outcome: values.desiredOutcome } : {}),
    };
  }
  if (currentStep === 'discipline') {
    return { discipline: values.discipline };
  }
  if (currentStep === 'qualification') {
    return {
      project_type: values.projectType,
      location: values.location,
      objective: values.objective,
      ...(values.currentStage ? { current_stage: values.currentStage } : {}),
      ...(values.urgency ? { urgency: values.urgency } : {}),
    };
  }
  if (currentStep === 'documents') {
    return {
      ...(values.hasDocuments != null ? { has_documents: values.hasDocuments } : {}),
      ...(values.documentNotes.trim() ? { document_notes: values.documentNotes } : {}),
    };
  }
  if (currentStep === 'scope_confirm') {
    return { scope_confirmed: values.scopeConfirmed };
  }
  return {};
}

export function emptyValues(): EngineeringStepValues {
  return {
    problemStatement: '',
    desiredOutcome: '',
    discipline: '',
    projectType: '',
    location: '',
    objective: '',
    currentStage: '',
    urgency: '',
    hasDocuments: null,
    documentNotes: '',
    scopeConfirmed: false,
  };
}

export function syncFromContext(context: EngineeringConsultingContext): EngineeringStepValues {
  return {
    problemStatement: context.problem_statement ?? '',
    desiredOutcome: context.desired_outcome ?? '',
    discipline: context.discipline ?? '',
    projectType: context.project_type ?? '',
    location: context.location ?? '',
    objective: context.objective ?? '',
    currentStage: context.current_stage ?? '',
    urgency: context.urgency ?? '',
    hasDocuments: context.has_documents ?? null,
    documentNotes: context.document_notes ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
  };
}
