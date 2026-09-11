import { useAuth } from '@/features/auth/context/AuthContext';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as josClient from '@/features/journeys/core/josClient';
import type {
  AdvanceJourneyInput,
  JourneyInstance,
  RecordEventInput,
  StartJourneyInput,
} from '@/features/journeys/core/types';

interface JourneyContextValue {
  anonymousSessionId: string;
  currentInstance: JourneyInstance | null;
  isHydrating: boolean;
  setCurrentInstance: (instance: JourneyInstance | null) => void;
  startJourney: (input: StartJourneyInput) => Promise<JourneyInstance>;
  getInstance: (instanceId: number) => Promise<JourneyInstance>;
  advance: (instanceId: number, input?: AdvanceJourneyInput) => Promise<JourneyInstance>;
  revisit: (instanceId: number, targetStepKey: string) => Promise<JourneyInstance>;
  pause: (instanceId: number) => Promise<JourneyInstance>;
  resume: (instanceId: number) => Promise<JourneyInstance>;
  complete: (instanceId: number) => Promise<JourneyInstance>;
  recordEvent: (instanceId: number, input: RecordEventInput) => Promise<void>;
  refreshCurrentInstance: () => Promise<JourneyInstance | null>;
}

export const JourneyContext = createContext<JourneyContextValue | null>(null);

interface JourneyProviderProps {
  children: ReactNode;
}

function isResumable(instance: JourneyInstance): boolean {
  return instance.status === 'active' || instance.status === 'paused';
}

export function JourneyProvider({ children }: JourneyProviderProps) {
  const { user } = useAuth();
  const [anonymousSessionId] = useState(() => josClient.getOrCreateAnonymousSessionId());
  const [currentInstance, setCurrentInstanceState] = useState<JourneyInstance | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const attachAttemptedRef = useRef<number | null>(null);

  const setCurrentInstance = useCallback((instance: JourneyInstance | null) => {
    setCurrentInstanceState(instance);
    if (instance) {
      josClient.setActiveJourneyInstanceId(instance.id);
    }
  }, []);

  const refreshCurrentInstance = useCallback(async () => {
    const instanceId = currentInstance?.id ?? josClient.getActiveJourneyInstanceId();
    if (!instanceId) {
      return null;
    }

    const instance = await josClient.getJourneyInstance(instanceId, anonymousSessionId);
    setCurrentInstance(instance);
    return instance;
  }, [anonymousSessionId, currentInstance?.id, setCurrentInstance]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setIsHydrating(true);

      const storedId = josClient.getActiveJourneyInstanceId();
      if (storedId) {
        try {
          const instance = await josClient.getJourneyInstance(storedId, anonymousSessionId);
          if (!cancelled) {
            setCurrentInstanceState(instance);
            josClient.setActiveJourneyInstanceId(instance.id);
            setIsHydrating(false);
            return;
          }
        } catch {
          josClient.clearActiveJourneyInstanceId();
        }
      }

      try {
        const activeInstances = await josClient.listActiveInstances(undefined, anonymousSessionId);
        const resumable = activeInstances.find(isResumable);
        if (!cancelled && resumable) {
          setCurrentInstanceState(resumable);
          josClient.setActiveJourneyInstanceId(resumable.id);
        }
      } catch (error) {
        console.error('Failed to hydrate active journey instance', error);
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [anonymousSessionId]);

  useEffect(() => {
    if (!user || !currentInstance || currentInstance.user_id) {
      return;
    }
    if (attachAttemptedRef.current === currentInstance.id) {
      return;
    }

    attachAttemptedRef.current = currentInstance.id;

    async function attachAndRefresh() {
      try {
        const attached = await josClient.attachIdentity(currentInstance.id, anonymousSessionId);
        setCurrentInstance(attached);
        const refreshed = await josClient.getJourneyInstance(attached.id, anonymousSessionId);
        setCurrentInstance(refreshed);
      } catch (error) {
        console.error('Failed to attach journey identity', error);
        attachAttemptedRef.current = null;
      }
    }

    void attachAndRefresh();
  }, [anonymousSessionId, currentInstance, setCurrentInstance, user]);

  const startJourney = useCallback(
    async (input: StartJourneyInput) => {
      const instance = await josClient.startJourney({
        ...input,
        anonymous_session_id: input.anonymous_session_id ?? anonymousSessionId,
      });
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const getInstance = useCallback(
    async (instanceId: number) => {
      const instance = await josClient.getJourneyInstance(instanceId, anonymousSessionId);
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const advance = useCallback(
    async (instanceId: number, input: AdvanceJourneyInput = {}) => {
      const instance = await josClient.advanceJourney(instanceId, input, anonymousSessionId);
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const revisit = useCallback(
    async (instanceId: number, targetStepKey: string) => {
      const instance = await josClient.revisitJourneyStep(
        instanceId,
        targetStepKey,
        anonymousSessionId,
      );
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const pause = useCallback(
    async (instanceId: number) => {
      const instance = await josClient.pauseJourney(instanceId, anonymousSessionId);
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const resume = useCallback(
    async (instanceId: number) => {
      const instance = await josClient.resumeJourney(instanceId, anonymousSessionId);
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const complete = useCallback(
    async (instanceId: number) => {
      const instance = await josClient.completeJourney(instanceId, anonymousSessionId);
      setCurrentInstance(instance);
      return instance;
    },
    [anonymousSessionId, setCurrentInstance],
  );

  const recordEvent = useCallback(
    async (instanceId: number, input: RecordEventInput) => {
      await josClient.recordJourneyEvent(instanceId, input, anonymousSessionId);
    },
    [anonymousSessionId],
  );

  const value = useMemo(
    () => ({
      anonymousSessionId,
      currentInstance,
      isHydrating,
      setCurrentInstance,
      startJourney,
      getInstance,
      advance,
      revisit,
      pause,
      resume,
      complete,
      recordEvent,
      refreshCurrentInstance,
    }),
    [
      anonymousSessionId,
      currentInstance,
      isHydrating,
      setCurrentInstance,
      startJourney,
      getInstance,
      advance,
      revisit,
      pause,
      resume,
      complete,
      recordEvent,
      refreshCurrentInstance,
    ],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
