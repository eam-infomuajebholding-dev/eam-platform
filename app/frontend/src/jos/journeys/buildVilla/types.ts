export type LandOwnershipType = 'owned' | 'leased' | 'planning_to_acquire' | 'other';

export type DesiredService = 'design_only' | 'supervision' | 'execution' | 'full_service';

export interface DocumentRef {
  label: string;
  url?: string | null;
}

export interface BuildVillaContext {
  city?: string;
  land_ownership_type?: LandOwnershipType;
  land_area_sqm?: number;
  has_documents?: boolean;
  document_notes?: string;
  document_refs?: DocumentRef[];
  desired_service?: DesiredService;
  draft_status?: string;
  intake_draft?: BuildVillaIntakeDraft;
}

export interface BuildVillaIntakeDraft {
  journey_type: 'build_villa';
  city?: string;
  land_ownership_type?: LandOwnershipType;
  land_area_sqm?: number;
  has_documents?: boolean;
  document_notes?: string;
  document_refs?: DocumentRef[];
  desired_service?: DesiredService;
  draft_status: string;
  assembled_at: string;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface JourneyValidationErrorResponse {
  errors: FieldValidationErrorDetail[];
}

export const BUILD_VILLA_JOURNEY_TYPE = 'build_villa';

export const BUILD_VILLA_STEPS = [
  'city',
  'land_ownership',
  'land_area',
  'documents_context',
  'desired_service',
  'intake_complete',
] as const;

export type BuildVillaStepKey = (typeof BUILD_VILLA_STEPS)[number];
