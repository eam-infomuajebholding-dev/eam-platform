export type WorkspaceAction =
  | 'start_journey'
  | 'general_answer'
  | 'journey_guidance'
  | 'ai_unavailable';

export interface JourneySnapshot {
  journey_instance_id: number;
  journey_type: string;
  current_step_key: string;
  status: string;
  context: Record<string, unknown>;
}

export interface WorkspaceTurnRequest {
  message: string;
  intent_hint?: string;
  journey_snapshot?: JourneySnapshot;
  stream?: boolean;
}

export interface WorkspaceTurnResponse {
  action: WorkspaceAction;
  journey_type?: string | null;
  assistant_message: string;
  ai_available: boolean;
  stream: boolean;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const BUILD_VILLA_QUICK_ACTION_LABEL = 'أبني منزلًا';
export const BUILD_VILLA_INTENT_HINT = 'build_villa';
