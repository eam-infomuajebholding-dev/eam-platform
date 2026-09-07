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

export function buildAdvanceInput(
  currentStep: string | null,
  values: {
    city: string;
    landOwnershipType: string;
    landAreaSqm: string;
    hasDocuments: boolean | null;
    documentNotes: string;
    desiredService: string;
  },
): Record<string, unknown> {
  if (currentStep === 'city') {
    return { city: values.city };
  }
  if (currentStep === 'land_ownership') {
    return { land_ownership_type: values.landOwnershipType };
  }
  if (currentStep === 'land_area') {
    return { land_area_sqm: values.landAreaSqm ? Number(values.landAreaSqm) : values.landAreaSqm };
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
  return {};
}
