import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface ValuationStepValues {
  valuationPurpose: string;
  assetType: string;
  location: string;
  assetDescription: string;
  areaSqm: string;
  ownershipStatus: string;
  deedAvailable: boolean | null;
  titleDocsAvailable: boolean | null;
  rentRollAvailable: boolean | null;
  plansAvailable: boolean | null;
  documentNotes: string;
  inspectionReadiness: string;
  desiredTimeline: string;
  urgency: string;
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
  values: ValuationStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'valuation_purpose':
      return { valuation_purpose: values.valuationPurpose };
    case 'asset_type':
      return { asset_type: values.assetType };
    case 'asset_location':
      return { location: values.location };
    case 'asset_description':
      return {
        asset_description: values.assetDescription,
        ...(values.areaSqm.trim() ? { area_sqm: values.areaSqm.trim() } : {}),
      };
    case 'ownership_context':
      return { ownership_status: values.ownershipStatus };
    case 'document_readiness':
      return {
        ...(values.deedAvailable != null ? { deed_available: values.deedAvailable } : {}),
        ...(values.titleDocsAvailable != null ? { title_docs_available: values.titleDocsAvailable } : {}),
        ...(values.rentRollAvailable != null ? { rent_roll_available: values.rentRollAvailable } : {}),
        ...(values.plansAvailable != null ? { plans_available: values.plansAvailable } : {}),
        ...(values.documentNotes.trim() ? { document_notes: values.documentNotes } : {}),
      };
    case 'inspection_readiness':
      return { inspection_readiness: values.inspectionReadiness };
    case 'timeline_context':
      return {
        desired_timeline: values.desiredTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
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
