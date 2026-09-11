export const BUILDING_MATERIALS_JOURNEY_TYPE = 'building_materials';

export interface BuildingMaterialsContext {
  procurement_goal?: string;
  material_category?: string;
  project_context?: string;
  delivery_location?: string;
  quantity_scope?: string;
  specifications_context?: string;
  target_timeline?: string;
  urgency?: string;
  budget_context?: string;
  supplier_context?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
