import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as aiCoreClient from '@/ai/aiCoreClient';
import {
  BUILD_VILLA_INTENT_HINT,
  BUILD_VILLA_QUICK_ACTION_LABEL,
  type WorkspaceMessage,
} from '@/ai/types';
import { useJourney } from '@/jos/useJourney';
import type { JourneyInstance } from '@/jos/types';
import {
  buildAdvanceInput,
  extractExistingInstanceId,
  extractFieldErrors,
  getErrorMessage,
} from '@/jos/journeys/buildVilla/errors';
import type { BuildVillaStepValues } from '@/jos/journeys/buildVilla/BuildVillaStepPanel';
import type { BuildVillaContext, FieldValidationErrorDetail } from '@/jos/journeys/buildVilla/types';
import { BUILD_VILLA_JOURNEY_TYPE } from '@/jos/journeys/buildVilla/types';

type WorkspaceMode = 'chat' | 'journey';

interface CompletionNotice {
  kind: 'authenticated' | 'anonymous';
  serviceRequestId?: number | null;
}

interface WorkspaceContextValue {
  mode: WorkspaceMode;
  messages: WorkspaceMessage[];
  streamingContent: string;
  isBusy: boolean;
  workspaceError: string | null;
  currentInstance: JourneyInstance | null;
  completionNotice: CompletionNotice | null;
  stepValues: BuildVillaStepValues;
  setStepValues: (values: BuildVillaStepValues) => void;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  sendMessage: (message: string) => Promise<void>;
  startBuildVillaFromQuickAction: () => Promise<void>;
  advanceCurrentStep: () => Promise<void>;
  completeCurrentJourney: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const emptyStepValues = (): BuildVillaStepValues => ({
  city: '',
  landOwnershipType: '',
  landAreaSqm: '',
  hasDocuments: null,
  documentNotes: '',
  desiredService: '',
});

function createMessage(role: WorkspaceMessage['role'], content: string): WorkspaceMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function syncStepValuesFromContext(context: BuildVillaContext): BuildVillaStepValues {
  return {
    city: context.city ?? '',
    landOwnershipType: context.land_ownership_type ?? '',
    landAreaSqm: context.land_area_sqm != null ? String(context.land_area_sqm) : '',
    hasDocuments: context.has_documents ?? null,
    documentNotes: context.document_notes ?? '',
    desiredService: context.desired_service ?? '',
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    currentInstance,
    startJourney,
    advance,
    complete,
    recordEvent,
    getInstance,
  } = useJourney();

  const [mode, setMode] = useState<WorkspaceMode>('chat');
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [completionNotice, setCompletionNotice] = useState<CompletionNotice | null>(null);
  const [stepValues, setStepValues] = useState<BuildVillaStepValues>(emptyStepValues);
  const [fieldErrors, setFieldErrors] = useState<FieldValidationErrorDetail[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const context = (currentInstance?.context ?? {}) as BuildVillaContext;
  const isJourneyActive =
    currentInstance?.journey_type === BUILD_VILLA_JOURNEY_TYPE &&
    (currentInstance.status === 'active' || currentInstance.status === 'paused');

  useEffect(() => {
    if (!currentInstance || currentInstance.journey_type !== BUILD_VILLA_JOURNEY_TYPE) {
      return;
    }
    setStepValues(syncStepValuesFromContext(context));
    if (currentInstance.status === 'active' || currentInstance.status === 'paused') {
      setMode('journey');
    }
    if (currentInstance.status === 'completed') {
      setMode('chat');
    }
  }, [currentInstance, context.city, context.desired_service, context.document_notes, context.has_documents, context.land_area_sqm, context.land_ownership_type]);

  const handoffToJourney = useCallback(
    async (assistantMessage: string, source: 'quick_action' | 'free_text') => {
      let instance;
      try {
        instance = await startJourney({
          journey_type: BUILD_VILLA_JOURNEY_TYPE,
          initial_context: { source_channel: 'hero_workspace', handoff_source: source },
        });
      } catch (error) {
        const existingId = extractExistingInstanceId(error);
        if (!existingId) {
          throw error;
        }
        instance = await getInstance(existingId);
      }

      await recordEvent(instance.id, {
        event_type: 'ai_handoff',
        payload: { source, journey_type: BUILD_VILLA_JOURNEY_TYPE },
      });
      setMessages((prev) => [...prev, createMessage('assistant', assistantMessage)]);
      setMode('journey');
      setWorkspaceError(null);
      await getInstance(instance.id);
    },
    [getInstance, recordEvent, startJourney],
  );

  const startBuildVillaFromQuickAction = useCallback(async () => {
    if (isBusy || isJourneyActive) {
      return;
    }
    setIsBusy(true);
    setWorkspaceError(null);
    setStreamingContent('');
    setMessages((prev) => [...prev, createMessage('user', BUILD_VILLA_QUICK_ACTION_LABEL)]);

    try {
      await handoffToJourney(
        'رائع! سأساعدك في بدء رحلة جمع معلومات بناء الفيلا. لنبدأ خطوة بخطوة — أولاً أخبرني عن المدينة.',
        'quick_action',
      );
    } catch (error) {
      console.error(error);
      setWorkspaceError('تعذر بدء رحلة بناء الفيلا. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsBusy(false);
    }
  }, [handoffToJourney, isBusy, isJourneyActive]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isBusy) {
        return;
      }

      if (isJourneyActive) {
        return;
      }

      setIsBusy(true);
      setWorkspaceError(null);
      setStreamingContent('');
      setMessages((prev) => [...prev, createMessage('user', trimmed)]);

      try {
        const turn = await aiCoreClient.workspaceTurn({ message: trimmed, stream: true });

        if (turn.action === 'start_journey' && turn.journey_type === BUILD_VILLA_JOURNEY_TYPE) {
          await handoffToJourney(turn.assistant_message, 'free_text');
          return;
        }

        if (turn.action === 'ai_unavailable') {
          setMessages((prev) => [...prev, createMessage('assistant', turn.assistant_message)]);
          setWorkspaceError(turn.assistant_message);
          return;
        }

        if (turn.action === 'general_answer') {
          if (turn.stream) {
            let streamed = '';
            streamed = await aiCoreClient.streamGeneralAnswer({ message: trimmed }, (content) => {
              setStreamingContent(content);
            });
            setStreamingContent('');
            setMessages((prev) => [...prev, createMessage('assistant', streamed || turn.assistant_message)]);
          } else {
            setMessages((prev) => [...prev, createMessage('assistant', turn.assistant_message)]);
          }
          return;
        }

        setMessages((prev) => [...prev, createMessage('assistant', turn.assistant_message)]);
      } catch (error) {
        console.error(error);
        const failure = 'تعذر معالجة رسالتك حالياً. يمكنك استخدام «أبني منزلًا» لبدء رحلة بناء الفيلا.';
        setWorkspaceError(failure);
        setMessages((prev) => [...prev, createMessage('assistant', failure)]);
      } finally {
        setIsBusy(false);
        setStreamingContent('');
      }
    },
    [handoffToJourney, isBusy, isJourneyActive],
  );

  const advanceCurrentStep = useCallback(async () => {
    if (!currentInstance || isBusy) {
      return;
    }

    setIsBusy(true);
    setFieldErrors([]);
    setFormError(null);

    const input = buildAdvanceInput(currentInstance.current_step_key, stepValues);
    try {
      await advance(currentInstance.id, { input });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      setFormError(getErrorMessage(errors, 'تعذر إرسال هذه الخطوة. يرجى مراجعة البيانات.'));
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }, [advance, currentInstance, isBusy, stepValues]);

  const completeCurrentJourney = useCallback(async () => {
    if (!currentInstance || isBusy) {
      return;
    }
    setIsBusy(true);
    setFormError(null);
    try {
      const instance = await complete(currentInstance.id);
      setMode('chat');
      if (user && instance.service_request_id) {
        setCompletionNotice({
          kind: 'authenticated',
          serviceRequestId: instance.service_request_id,
        });
        await queryClient.invalidateQueries({ queryKey: ['service-requests'] });
        setMessages((prev) => [...prev, createMessage('assistant', 'تم استلام طلبك.')]);
      } else {
        setCompletionNotice({ kind: 'anonymous' });
        setMessages((prev) => [
          ...prev,
          createMessage(
            'assistant',
            'تم إكمال رحلة جمع المعلومات. سجّل الدخول للوصول إلى طلبك في مساحة العميل.',
          ),
        ]);
      }
    } catch (error) {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }, [complete, currentInstance, isBusy, queryClient, user]);

  const value = useMemo(
    () => ({
      mode,
      messages,
      streamingContent,
      isBusy,
      workspaceError,
      currentInstance,
      completionNotice,
      stepValues,
      setStepValues,
      fieldErrors,
      formError,
      sendMessage,
      startBuildVillaFromQuickAction,
      advanceCurrentStep,
      completeCurrentJourney,
    }),
    [
      mode,
      messages,
      streamingContent,
      isBusy,
      workspaceError,
      currentInstance,
      completionNotice,
      stepValues,
      fieldErrors,
      formError,
      sendMessage,
      startBuildVillaFromQuickAction,
      advanceCurrentStep,
      completeCurrentJourney,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export { BUILD_VILLA_QUICK_ACTION_LABEL, BUILD_VILLA_INTENT_HINT };
