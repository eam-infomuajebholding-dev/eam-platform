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
