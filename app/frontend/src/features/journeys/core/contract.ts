/**
 * Shared journey contract (WO-P2-JRN-CONTRACT-001).
 * JOS remains authoritative for transitions; this types the frontend/runtime boundary.
 */

export type JourneyKey = string;

export type JourneyDefinitionVersion = number | string;

export type JourneyTransitionResult =
  | { ok: true; nextStepKey: string; contextPatch?: Record<string, unknown> }
  | { ok: false; reason: string; fieldErrors?: Record<string, string> };

/** Definition metadata — owned by JOS / journey_definitions table. */
export interface JourneyDefinitionContract {
  journey_key: JourneyKey;
  version: JourneyDefinitionVersion;
  sector_slug?: string;
  entry_intent?: string;
  steps: Array<{ key: string; title?: string; required?: boolean }>;
}

/** Runtime instance — JOS-owned state surfaced to UI. */
export interface JourneyInstanceContract {
  id: number;
  journey_key: JourneyKey;
  definition_version: JourneyDefinitionVersion;
  current_step_key: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | string;
  context: Record<string, unknown>;
}

export interface JourneyFirstValueEvent {
  journey_key: JourneyKey;
  output_type: string;
  output_ref?: string;
  preliminary: boolean;
  human_review_required: boolean;
}

export interface JourneyHandoffContract {
  journey_instance_id: number;
  service_request_id?: number;
  summary: string;
  preserves_context: boolean;
}

/** Allowed UI actions are derived from JOS — UI must not invent transitions. */
export type JourneyAllowedAction =
  | 'advance'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'record_event';

export const ENGINEERING_CONSULTING_JOURNEY_KEY = 'engineering_consulting';
