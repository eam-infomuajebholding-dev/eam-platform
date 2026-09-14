/** Shared JOS field validation error parsing (all journeys). */

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

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

/** Resume an in-progress instance when start returns HTTP 409. */
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
