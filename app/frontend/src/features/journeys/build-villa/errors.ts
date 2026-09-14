export {
  extractExistingInstanceId,
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { BuildVillaContext } from './types';

export interface BuildVillaStepValues {
  projectObjective: string;
  city: string;
  landOwnershipType: string;
  landAreaSqm: string;
  householdSize: string;
  useSummary: string;
  accessibilityNeeds: string;
  staffAreasNeeded: string;
  futureExpansionNotes: string;
  floors: string;
  bedrooms: string;
  selectedSpaces: string[];
  spaceNotes: string;
  budgetRange: string;
  desiredStart: string;
  urgency: string;
  designStyle: string;
  designNotes: string;
  hasDocuments: boolean | null;
  documentNotes: string;
  desiredService: string;
  scopeConfirmed: boolean;
  submitConfirmed: boolean;
}

export function buildAdvanceInput(
  currentStep: string | null,
  values: BuildVillaStepValues,
): Record<string, unknown> {
  if (currentStep === 'project_intent') {
    return { project_objective: values.projectObjective };
  }
  if (currentStep === 'city') {
    return { city: values.city };
  }
  if (currentStep === 'land_ownership') {
    return { land_ownership_type: values.landOwnershipType };
  }
  if (currentStep === 'land_area') {
    return { land_area_sqm: values.landAreaSqm ? Number(values.landAreaSqm) : values.landAreaSqm };
  }
  if (currentStep === 'household_needs') {
    return {
      ...(values.householdSize ? { household_size: Number(values.householdSize) } : {}),
      ...(values.useSummary.trim() ? { use_summary: values.useSummary } : {}),
      ...(values.accessibilityNeeds.trim() ? { accessibility_needs: values.accessibilityNeeds } : {}),
      ...(values.staffAreasNeeded.trim() ? { staff_areas_needed: values.staffAreasNeeded } : {}),
      ...(values.futureExpansionNotes.trim()
        ? { future_expansion_notes: values.futureExpansionNotes }
        : {}),
    };
  }
  if (currentStep === 'space_program') {
    return {
      ...(values.floors ? { floors: Number(values.floors) } : {}),
      ...(values.bedrooms ? { bedrooms: Number(values.bedrooms) } : {}),
      ...(values.selectedSpaces.length ? { selected_spaces: values.selectedSpaces } : {}),
      ...(values.spaceNotes.trim() ? { space_notes: values.spaceNotes } : {}),
    };
  }
  if (currentStep === 'budget_context') {
    return { budget_range: values.budgetRange };
  }
  if (currentStep === 'timeline_context') {
    return {
      desired_start: values.desiredStart,
      ...(values.urgency ? { urgency: values.urgency } : {}),
    };
  }
  if (currentStep === 'design_direction') {
    return {
      design_style: values.designStyle,
      ...(values.designNotes.trim() ? { design_notes: values.designNotes } : {}),
    };
  }
  if (currentStep === 'documents_context') {
    return {
      ...(values.hasDocuments != null ? { has_documents: values.hasDocuments } : {}),
      ...(values.documentNotes.trim() ? { document_notes: values.documentNotes } : {}),
    };
  }
  if (currentStep === 'desired_service') {
    return { desired_service: values.desiredService };
  }
  if (currentStep === 'summary_review' || currentStep === 'brief_review') {
    return {};
  }
  if (currentStep === 'scope_confirm') {
    return { scope_confirmed: values.scopeConfirmed };
  }
  if (currentStep === 'submit_confirm') {
    return { submit_confirmed: values.submitConfirmed };
  }
  return {};
}

export function syncFromContext(context: BuildVillaContext): BuildVillaStepValues {
  return {
    projectObjective: context.project_objective ?? '',
    city: context.city ?? '',
    landOwnershipType: context.land_ownership_type ?? '',
    landAreaSqm: context.land_area_sqm != null ? String(context.land_area_sqm) : '',
    householdSize: context.household_size != null ? String(context.household_size) : '',
    useSummary: context.use_summary ?? '',
    accessibilityNeeds: context.accessibility_needs ?? '',
    staffAreasNeeded: context.staff_areas_needed ?? '',
    futureExpansionNotes: context.future_expansion_notes ?? '',
    floors: context.floors != null ? String(context.floors) : '',
    bedrooms: context.bedrooms != null ? String(context.bedrooms) : '',
    selectedSpaces: context.selected_spaces ?? [],
    spaceNotes: context.space_notes ?? '',
    budgetRange: context.budget_range ?? '',
    desiredStart: context.desired_start ?? '',
    urgency: context.urgency ?? '',
    designStyle: context.design_style ?? '',
    designNotes: context.design_notes ?? '',
    hasDocuments: context.has_documents ?? null,
    documentNotes: context.document_notes ?? '',
    desiredService: context.desired_service ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

export function emptyValues(): BuildVillaStepValues {
  return {
    projectObjective: '',
    city: '',
    landOwnershipType: '',
    landAreaSqm: '',
    householdSize: '',
    useSummary: '',
    accessibilityNeeds: '',
    staffAreasNeeded: '',
    futureExpansionNotes: '',
    floors: '',
    bedrooms: '',
    selectedSpaces: [],
    spaceNotes: '',
    budgetRange: '',
    desiredStart: '',
    urgency: '',
    designStyle: '',
    designNotes: '',
    hasDocuments: null,
    documentNotes: '',
    desiredService: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}
