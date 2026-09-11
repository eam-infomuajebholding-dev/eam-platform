import { client } from '@/lib/api';
import type {
  AdvanceJourneyInput,
  JourneyDefinition,
  JourneyEvent,
  JourneyInstance,
  RecordEventInput,
  StartJourneyInput,
} from '@/features/journeys/core/types';

const ANONYMOUS_SESSION_STORAGE_KEY = 'eam-anonymous-session-id';
export const ACTIVE_JOURNEY_INSTANCE_STORAGE_KEY = 'eam-active-journey-instance-id';

function createAnonymousSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return createAnonymousSessionId();
  }

  const existing = sessionStorage.getItem(ANONYMOUS_SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createAnonymousSessionId();
  sessionStorage.setItem(ANONYMOUS_SESSION_STORAGE_KEY, created);
  return created;
}

export function getActiveJourneyInstanceId(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = sessionStorage.getItem(ACTIVE_JOURNEY_INSTANCE_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setActiveJourneyInstanceId(instanceId: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(ACTIVE_JOURNEY_INSTANCE_STORAGE_KEY, String(instanceId));
}

export function clearActiveJourneyInstanceId(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(ACTIVE_JOURNEY_INSTANCE_STORAGE_KEY);
}

export class JosApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    const message =
      typeof detail === 'string'
        ? detail
        : typeof detail === 'object' && detail && 'message' in detail
          ? String((detail as { message: unknown }).message)
          : 'JOS request failed';
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function extractErrorPayload(error: unknown): { status?: number; detail?: unknown } {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const maybeError = error as {
    status?: number;
    detail?: unknown;
    response?: { status?: number; data?: { detail?: unknown } };
    data?: { detail?: unknown };
  };

  return {
    status: maybeError.status ?? maybeError.response?.status,
    detail:
      maybeError.detail ??
      maybeError.response?.data?.detail ??
      maybeError.data?.detail ??
      maybeError.response?.data,
  };
}

function josHeaders(anonymousSessionId?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const sessionId = anonymousSessionId ?? getOrCreateAnonymousSessionId();
  if (sessionId) {
    headers['X-Anonymous-Session-Id'] = sessionId;
  }
  return headers;
}

async function invokeJos<T>(
  url: string,
  method: 'GET' | 'POST',
  data?: unknown,
  anonymousSessionId?: string,
): Promise<T> {
  try {
    const response = await client.apiCall.invoke({
      url,
      method,
      data,
      options: {
        headers: josHeaders(anonymousSessionId),
      },
    });

    return response.data as T;
  } catch (error: unknown) {
    const { status, detail } = extractErrorPayload(error);
    throw new JosApiError(status ?? 500, detail ?? error);
  }
}

export async function listJourneyDefinitions(): Promise<JourneyDefinition[]> {
  const response = await invokeJos<{ items: JourneyDefinition[] }>(
    '/api/v1/jos/definitions',
    'GET',
  );
  return response.items;
}

export async function getJourneyDefinition(
  journeyType: string,
): Promise<JourneyDefinition> {
  return invokeJos<JourneyDefinition>(`/api/v1/jos/definitions/${journeyType}`, 'GET');
}

export async function startJourney(
  input: StartJourneyInput,
): Promise<JourneyInstance> {
  const anonymousSessionId = input.anonymous_session_id ?? getOrCreateAnonymousSessionId();
  const instance = await invokeJos<JourneyInstance>(
    '/api/v1/jos/instances/start',
    'POST',
    {
      journey_type: input.journey_type,
      anonymous_session_id: anonymousSessionId,
      initial_context: input.initial_context ?? {},
    },
    anonymousSessionId,
  );
  setActiveJourneyInstanceId(instance.id);
  return instance;
}

export async function listActiveInstances(
  journeyType?: string,
  anonymousSessionId?: string,
): Promise<JourneyInstance[]> {
  const query = journeyType ? `?journey_type=${encodeURIComponent(journeyType)}` : '';
  const response = await invokeJos<{ items: JourneyInstance[] }>(
    `/api/v1/jos/instances/active${query}`,
    'GET',
    undefined,
    anonymousSessionId,
  );
  return response.items;
}

export async function attachIdentity(
  instanceId: number,
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  const instance = await invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}/attach`,
    'POST',
    {},
    anonymousSessionId,
  );
  setActiveJourneyInstanceId(instance.id);
  return instance;
}

export async function getJourneyInstance(
  instanceId: number,
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  return invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}`,
    'GET',
    undefined,
    anonymousSessionId,
  );
}

export async function advanceJourney(
  instanceId: number,
  input: AdvanceJourneyInput = {},
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  return invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}/advance`,
    'POST',
    { input: input.input ?? {} },
    anonymousSessionId,
  );
}

export async function revisitJourneyStep(
  instanceId: number,
  targetStepKey: string,
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  return invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}/revisit`,
    'POST',
    { target_step_key: targetStepKey },
    anonymousSessionId,
  );
}

export async function pauseJourney(
  instanceId: number,
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  return invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}/pause`,
    'POST',
    {},
    anonymousSessionId,
  );
}

export async function resumeJourney(
  instanceId: number,
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  return invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}/resume`,
    'POST',
    {},
    anonymousSessionId,
  );
}

export async function completeJourney(
  instanceId: number,
  anonymousSessionId?: string,
): Promise<JourneyInstance> {
  return invokeJos<JourneyInstance>(
    `/api/v1/jos/instances/${instanceId}/complete`,
    'POST',
    {},
    anonymousSessionId,
  );
}

export async function recordJourneyEvent(
  instanceId: number,
  input: RecordEventInput,
  anonymousSessionId?: string,
): Promise<JourneyEvent> {
  return invokeJos<JourneyEvent>(
    `/api/v1/jos/instances/${instanceId}/events`,
    'POST',
    input,
    anonymousSessionId,
  );
}

export async function listJourneyEvents(
  instanceId: number,
  anonymousSessionId?: string,
): Promise<JourneyEvent[]> {
  const response = await invokeJos<{ items: JourneyEvent[] }>(
    `/api/v1/jos/instances/${instanceId}/events`,
    'GET',
    undefined,
    anonymousSessionId,
  );
  return response.items;
}
