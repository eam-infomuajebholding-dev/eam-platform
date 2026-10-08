import { client } from '@/lib/api';
import { getStoredAuthToken } from '@/features/auth/utils/authTokenStorage';
import { getActiveJourneyInstanceId, getOrCreateAnonymousSessionId } from '@/features/journeys/core/josClient';
import type {
  JourneySnapshot,
  WorkspaceClientHints,
  WorkspaceSurface,
  WorkspaceTurnRequest,
  WorkspaceTurnResponse,
} from './types';

export function buildWorkspaceClientHints(surface?: WorkspaceSurface): WorkspaceClientHints {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'ar';
  const resolved = surface ?? (path.startsWith('/journeys/') ? 'journey' : 'home');
  const journeyId = getActiveJourneyInstanceId();
  return {
    surface: resolved,
    route: path,
    locale: lang.toLowerCase().startsWith('en') ? 'en' : 'ar',
    ...(journeyId != null ? { journey_instance_id: journeyId } : {}),
  };
}

function aiCoreHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Anonymous-Session-Id': getOrCreateAnonymousSessionId(),
  };
  const token = getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const AI_CONVERSATION_STORAGE_KEY = 'eam-ai-conversation-id';

export function readStoredConversationId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage.getItem(AI_CONVERSATION_STORAGE_KEY);
}

export function storeConversationId(conversationId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(AI_CONVERSATION_STORAGE_KEY, conversationId);
}

export async function loadConversation(
  conversationId: string,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }> | null> {
  const response = await fetch(`/api/v1/ai-core/workspace/conversation/${conversationId}`, {
    headers: aiCoreHeaders(),
  });
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as {
    messages?: Array<{ role?: string; content?: string }>;
  };
  return (body.messages ?? [])
    .filter((entry) => (entry.role === 'user' || entry.role === 'assistant') && entry.content)
    .map((entry) => ({
      role: entry.role as 'user' | 'assistant',
      content: String(entry.content),
    }));
}

function withClientHints(input: WorkspaceTurnRequest): WorkspaceTurnRequest {
  return {
    ...input,
    client_hints: input.client_hints ?? buildWorkspaceClientHints(),
  };
}

export interface ToolExecuteRequest {
  tool_id: string;
  payload?: Record<string, unknown>;
  confirmation_present?: boolean;
  trace_id?: string;
}

export interface ToolExecuteResponse {
  tool_id: string;
  trace_id: string;
  status: 'success' | 'denied' | string;
  data?: Record<string, unknown> | null;
  safe_message?: string | null;
  error_code?: string | null;
  audit_reference?: string | null;
}

export async function workspaceTurn(input: WorkspaceTurnRequest): Promise<WorkspaceTurnResponse> {
  const response = await client.apiCall.invoke({
    url: '/api/v1/ai-core/workspace/turn',
    method: 'POST',
    data: withClientHints(input),
    headers: aiCoreHeaders(),
  });
  return response.data as WorkspaceTurnResponse;
}

export async function executeTool(input: ToolExecuteRequest): Promise<ToolExecuteResponse> {
  const anonymousSessionId = getOrCreateAnonymousSessionId();
  const response = await client.apiCall.invoke({
    url: '/api/v1/ai/tools/execute',
    method: 'POST',
    data: input,
    options: {
      headers: {
        'X-Anonymous-Session-Id': anonymousSessionId,
      },
    },
  });
  return response.data as ToolExecuteResponse;
}

export async function streamFaqAnswer(
  message: string,
  onChunk: (content: string) => void,
): Promise<string> {
  return streamGeneralAnswer({ message, mode: 'faq', stream: true }, onChunk);
}

export async function streamGeneralAnswer(
  input: WorkspaceTurnRequest,
  onChunk: (content: string) => void,
): Promise<string> {
  const response = await fetch('/api/v1/ai-core/workspace/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...aiCoreHeaders() },
    body: JSON.stringify(withClientHints(input)),
  });

  if (!response.ok || !response.body) {
    throw new Error('Streaming request failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) {
        continue;
      }
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') {
        continue;
      }
      try {
        const parsed = JSON.parse(payload) as { content?: string };
        if (parsed.content) {
          accumulated += parsed.content;
          onChunk(accumulated);
        }
      } catch {
        // ignore malformed chunks
      }
    }
  }

  return accumulated;
}

export function toJourneySnapshot(instance: {
  id: number;
  journey_type: string;
  current_step_key: string;
  status: string;
  context: Record<string, unknown>;
}): JourneySnapshot {
  return {
    journey_instance_id: instance.id,
    journey_type: instance.journey_type,
    current_step_key: instance.current_step_key,
    status: instance.status,
    context: instance.context,
  };
}
