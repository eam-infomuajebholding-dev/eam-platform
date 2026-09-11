import * as aiCoreClient from '@/features/ai-workspace/aiCoreClient';
import type { AIActionProposal } from '@/features/ai-workspace/types';

export interface ActionExecutionResult {
  status: 'success' | 'denied' | 'unsupported';
  journeyInstanceId?: number;
  safeMessage?: string;
  errorCode?: string;
  traceId?: string;
  viaToolGateway?: boolean;
}

const FAILURE_MESSAGES: Record<string, string> = {
  CONFIRMATION_MISSING: 'يلزم تأكيد الإجراء قبل التنفيذ.',
  AUTH_REQUIRED: 'يلزم تسجيل الدخول لتنفيذ هذا الإجراء.',
  PERMISSION_DENIED: 'تعذر تنفيذ الإجراء — صلاحيات غير كافية.',
  INVALID_ARGUMENTS: 'تعذر تنفيذ الإجراء — مدخلات غير صالحة.',
  UNSUPPORTED_JOURNEY: 'نوع الرحلة غير مدعوم حالياً.',
  DUPLICATE_ACTIVE_JOURNEY: 'يوجد رحلة نشطة بالفعل. يمكنك متابعة الرحلة الحالية.',
  ACTIVE_JOURNEY_CONFLICT: 'يوجد رحلة نشطة بالفعل. يمكنك متابعة الرحلة الحالية.',
  TOOL_EXECUTION_FAILED: 'تعذر إكمال العملية. يرجى المحاولة مرة أخرى.',
  UNKNOWN_TOOL: 'الإجراء غير متاح حالياً.',
  POLICY_DENIED: 'تعذر تنفيذ الإجراء وفق سياسة المنصة.',
};

export function actionFailureMessage(errorCode?: string | null, fallback?: string | null): string {
  if (errorCode && FAILURE_MESSAGES[errorCode]) {
    return FAILURE_MESSAGES[errorCode];
  }
  return fallback?.trim() || 'تعذر تنفيذ الإجراء. يرجى المحاولة مرة أخرى.';
}

export async function executeStartJourney(
  journeyType: string,
  traceId?: string | null,
): Promise<ActionExecutionResult> {
  let toolResult: aiCoreClient.ToolExecuteResponse | null = null;
  try {
    toolResult = await aiCoreClient.executeTool({
      tool_id: 'journey.start',
      payload: { journey_type: journeyType },
      confirmation_present: true,
      trace_id: traceId ?? undefined,
    });
  } catch {
    return {
      status: 'denied',
      errorCode: 'TOOL_EXECUTION_FAILED',
      safeMessage: actionFailureMessage('TOOL_EXECUTION_FAILED'),
      traceId: traceId ?? undefined,
      viaToolGateway: false,
    };
  }

  const resolvedTrace = toolResult.trace_id ?? traceId ?? undefined;

  if (toolResult.status === 'success' && toolResult.data?.journey_instance_id) {
    return {
      status: 'success',
      journeyInstanceId: Number(toolResult.data.journey_instance_id),
      safeMessage: toolResult.safe_message ?? undefined,
      traceId: resolvedTrace,
      viaToolGateway: true,
    };
  }

  if (toolResult.error_code === 'DUPLICATE_ACTIVE_JOURNEY') {
    const existingId = Number(toolResult.data?.existing_journey_instance_id);
    if (Number.isFinite(existingId)) {
      return {
        status: 'success',
        journeyInstanceId: existingId,
        safeMessage: toolResult.safe_message ?? undefined,
        errorCode: toolResult.error_code ?? undefined,
        traceId: resolvedTrace,
        viaToolGateway: true,
      };
    }
  }

  return {
    status: 'denied',
    errorCode: toolResult.error_code ?? 'POLICY_DENIED',
    safeMessage: actionFailureMessage(toolResult.error_code, toolResult.safe_message),
    traceId: resolvedTrace,
    viaToolGateway: true,
  };
}

export async function executeHumanHandoff(
  reason: string,
  traceId?: string | null,
  extras?: { conversation_summary?: string; journey_instance_id?: number; service_request_id?: number },
): Promise<ActionExecutionResult> {
  let toolResult: aiCoreClient.ToolExecuteResponse | null = null;
  try {
    toolResult = await aiCoreClient.executeTool({
      tool_id: 'human_handoff.request',
      payload: { reason, ...extras },
      confirmation_present: true,
      trace_id: traceId ?? undefined,
    });
  } catch {
    return {
      status: 'denied',
      errorCode: 'TOOL_EXECUTION_FAILED',
      safeMessage: actionFailureMessage('TOOL_EXECUTION_FAILED'),
      traceId: traceId ?? undefined,
    };
  }

  if (toolResult.status === 'success') {
    return {
      status: 'success',
      safeMessage: toolResult.safe_message ?? 'تم تسجيل طلب التحويل إلى فريق EAM.',
      traceId: toolResult.trace_id ?? traceId ?? undefined,
      viaToolGateway: true,
    };
  }

  return {
    status: 'denied',
    errorCode: toolResult.error_code ?? undefined,
    safeMessage: actionFailureMessage(toolResult.error_code, toolResult.safe_message),
    traceId: toolResult.trace_id ?? traceId ?? undefined,
    viaToolGateway: true,
  };
}

export async function executeActionProposal(
  proposal: AIActionProposal,
  traceId?: string | null,
): Promise<ActionExecutionResult> {
  if (proposal.action === 'START_JOURNEY' && proposal.journey_type) {
    return executeStartJourney(proposal.journey_type, traceId);
  }

  if (proposal.action === 'REQUEST_HUMAN_HANDOFF') {
    const reason =
      (typeof proposal.parameters?.reason === 'string' && proposal.parameters.reason) ||
      'طلب تحويل إلى مهندس';
    return executeHumanHandoff(reason, traceId, {
      conversation_summary:
        typeof proposal.parameters?.conversation_summary === 'string'
          ? proposal.parameters.conversation_summary
          : undefined,
      journey_instance_id:
        typeof proposal.parameters?.journey_instance_id === 'number'
          ? proposal.parameters.journey_instance_id
          : undefined,
      service_request_id:
        typeof proposal.parameters?.service_request_id === 'number'
          ? proposal.parameters.service_request_id
          : undefined,
    });
  }

  return {
    status: 'unsupported',
    errorCode: 'UNSUPPORTED_ACTION',
    safeMessage: 'هذا الإجراء غير مدعوم حالياً.',
    traceId: traceId ?? undefined,
  };
}
