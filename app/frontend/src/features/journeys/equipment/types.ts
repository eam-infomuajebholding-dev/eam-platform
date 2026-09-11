export const EQUIPMENT_JOURNEY_TYPE = 'equipment';

export interface EquipmentContext {
  equipment_need?: string;
  equipment_category?: string;
  usage_context?: string;
  location?: string;
  engagement_type?: string;
  specifications_context?: string;
  target_timeline?: string;
  urgency?: string;
  budget_context?: string;
  readiness_context?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
