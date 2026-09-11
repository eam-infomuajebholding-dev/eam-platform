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

export type WorkspaceMode = 'workspace' | 'faq';

export interface WorkspaceTurnRequest {
  message: string;
  intent_hint?: string;
  journey_snapshot?: JourneySnapshot;
  stream?: boolean;
  mode?: WorkspaceMode;
}

export type AIErrorCode =
  | 'AI_NOT_CONFIGURED'
  | 'AI_PROVIDER_TIMEOUT'
  | 'AI_PROVIDER_RATE_LIMITED'
  | 'AI_INVALID_STRUCTURED_OUTPUT'
  | 'AI_LOW_CONFIDENCE'
  | 'AI_POLICY_BLOCKED'
  | 'AI_TOOL_UNAUTHORIZED'
  | 'AI_TOOL_FAILED'
  | 'AI_RETRIEVAL_FAILED'
  | 'AI_CONTEXT_FORBIDDEN'
  | 'AI_BUDGET_EXCEEDED';

export type AIActionType =
  | 'ANSWER'
  | 'ASK_CLARIFICATION'
  | 'START_JOURNEY'
  | 'RESUME_JOURNEY'
  | 'SHOW_FIRST_VALUE'
  | 'OPEN_RESOURCE'
  | 'REQUEST_HUMAN_HANDOFF'
  | 'JOURNEY_GUIDANCE';

export interface AIError {
  code: AIErrorCode;
  message: string;
  user_message: string;
  retryable?: boolean;
}

export interface AIActionProposal {
  action: AIActionType;
  journey_type?: string | null;
  resource_ref?: string | null;
  parameters?: Record<string, unknown>;
  side_effect?: 'none' | 'read' | 'write';
}

export interface ResponseIntent {
  intent: string;
  confidence: number;
  candidate_journey?: string | null;
}

export interface WorkspaceTurnResponse {
  action: WorkspaceAction;
  journey_type?: string | null;
  assistant_message: string;
  ai_available: boolean;
  stream: boolean;
  contract_version?: string | null;
  trace_id?: string | null;
  message?: { role: 'assistant'; content: string; preliminary?: boolean } | null;
  intent?: ResponseIntent | null;
  actions?: AIActionProposal[];
  requires_confirmation?: boolean;
  handoff?: Record<string, unknown> | null;
  error?: AIError | null;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const BUILD_VILLA_QUICK_ACTION_LABEL = 'أبني منزلًا';
export const BUILD_VILLA_INTENT_HINT = 'build_villa';
