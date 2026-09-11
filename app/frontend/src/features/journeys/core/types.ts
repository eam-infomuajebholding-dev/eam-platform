export type JourneyStatus = 'active' | 'paused' | 'completed';

export interface WorkflowStep {
  key: string;
  label: string;
  required_fields?: string[];
  next?: string | null;
  terminal?: boolean;
}

export interface WorkflowDefinition {
  initial_step: string;
  steps: WorkflowStep[];
}

export interface JourneyDefinition {
  id: number;
  journey_type: string;
  name: string;
  description?: string | null;
  workflow_definition: WorkflowDefinition;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface JourneyInstance {
  id: number;
  journey_definition_id: number;
  journey_type: string;
  status: JourneyStatus;
  current_step_key: string;
  context: Record<string, unknown>;
  user_id?: string | null;
  anonymous_session_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
  service_request_id?: number | null;
}

export interface JourneyEvent {
  id: number;
  journey_instance_id: number;
  event_type: string;
  from_step?: string | null;
  to_step?: string | null;
  payload?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface StartJourneyInput {
  journey_type: string;
  anonymous_session_id?: string;
  initial_context?: Record<string, unknown>;
}

export interface AdvanceJourneyInput {
  input?: Record<string, unknown>;
}

export interface RecordEventInput {
  event_type: string;
  payload?: Record<string, unknown>;
}
