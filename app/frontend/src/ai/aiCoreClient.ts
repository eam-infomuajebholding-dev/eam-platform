import { client } from '@/lib/api';
import type { JourneySnapshot, WorkspaceTurnRequest, WorkspaceTurnResponse } from './types';

export async function workspaceTurn(input: WorkspaceTurnRequest): Promise<WorkspaceTurnResponse> {
  const response = await client.apiCall.invoke({
    url: '/api/v1/ai-core/workspace/turn',
    method: 'POST',
    data: input,
  });
  return response.data as WorkspaceTurnResponse;
}

export async function streamGeneralAnswer(
  input: WorkspaceTurnRequest,
  onChunk: (content: string) => void,
): Promise<string> {
  const response = await fetch('/api/v1/ai-core/workspace/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
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
