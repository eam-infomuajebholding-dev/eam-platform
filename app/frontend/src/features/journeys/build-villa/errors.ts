import type { FieldValidationErrorDetail } from './types';

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
    maybeResponse.response?.data?.detail ??
    maybeResponse.data?.detail ??
    maybeResponse.detail;

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

export function extractExistingInstanceId(error: unknown): number | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const maybeError = error as {
    status?: number;
    detail?: { existing_instance_id?: number } | string;
    response?: { status?: number; data?: { detail?: { existing_instance_id?: number } | string } };
  };

  const status = maybeError.status ?? maybeError.response?.status;
  if (status !== 409) {
    return null;
  }

  const detail = maybeError.detail ?? maybeError.response?.data?.detail;
  if (detail && typeof detail === 'object' && typeof detail.existing_instance_id === 'number') {
    return detail.existing_instance_id;
  }

  return null;
}

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

export function syncStepValuesFromContext(context: Record<string, unknown>): BuildVillaStepValues {
  return {
    projectObjective: (context.project_objective as string) ?? '',
    city: (context.city as string) ?? '',
    landOwnershipType: (context.land_ownership_type as string) ?? '',
    landAreaSqm: context.land_area_sqm != null ? String(context.land_area_sqm) : '',
    householdSize: context.household_size != null ? String(context.household_size) : '',
    useSummary: (context.use_summary as string) ?? '',
    accessibilityNeeds: (context.accessibility_needs as string) ?? '',
    staffAreasNeeded: (context.staff_areas_needed as string) ?? '',
    futureExpansionNotes: (context.future_expansion_notes as string) ?? '',
    floors: context.floors != null ? String(context.floors) : '',
    bedrooms: context.bedrooms != null ? String(context.bedrooms) : '',
    selectedSpaces: (context.selected_spaces as string[]) ?? [],
    spaceNotes: (context.space_notes as string) ?? '',
    budgetRange: (context.budget_range as string) ?? '',
    desiredStart: (context.desired_start as string) ?? '',
    urgency: (context.urgency as string) ?? '',
    designStyle: (context.design_style as string) ?? '',
    designNotes: (context.design_notes as string) ?? '',
    hasDocuments: (context.has_documents as boolean | null) ?? null,
    documentNotes: (context.document_notes as string) ?? '',
    desiredService: (context.desired_service as string) ?? '',
    scopeConfirmed: (context.scope_confirmed as boolean) ?? false,
    submitConfirmed: (context.submit_confirmed as boolean) ?? false,
  };
}

export function emptyStepValues(): BuildVillaStepValues {
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
