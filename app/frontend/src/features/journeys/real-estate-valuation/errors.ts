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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { RealEstateValuationContext } from './types';


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

export function emptyValues(): ValuationStepValues {
  return {
    valuationPurpose: '',
    assetType: '',
    location: '',
    assetDescription: '',
    areaSqm: '',
    ownershipStatus: '',
    deedAvailable: null,
    titleDocsAvailable: null,
    rentRollAvailable: null,
    plansAvailable: null,
    documentNotes: '',
    inspectionReadiness: '',
    desiredTimeline: '',
    urgency: '',
    engagementGoal: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: RealEstateValuationContext): ValuationStepValues {
  return {
    valuationPurpose: context.valuation_purpose ?? '',
    assetType: context.asset_type ?? '',
    location: context.location ?? '',
    assetDescription: context.asset_description ?? '',
    areaSqm: context.area_sqm != null ? String(context.area_sqm) : '',
    ownershipStatus: context.ownership_status ?? '',
    deedAvailable: context.deed_available ?? null,
    titleDocsAvailable: context.title_docs_available ?? null,
    rentRollAvailable: context.rent_roll_available ?? null,
    plansAvailable: context.plans_available ?? null,
    documentNotes: context.document_notes ?? '',
    inspectionReadiness: context.inspection_readiness ?? '',
    desiredTimeline: context.desired_timeline ?? '',
    urgency: context.urgency ?? '',
    engagementGoal: context.engagement_goal ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
