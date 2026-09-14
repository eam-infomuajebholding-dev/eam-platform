/**
 * GLOBAL EAM COPILOT — platform contract (frontend shell)
 *
 * SCOPE              = PLATFORM_WIDE
 * POSITION           = PERSISTENT_BOTTOM
 * VISIBLE_ACROSS_ROUTES = YES (except ASSISTANT_EXCLUDED_PATH_PREFIXES)
 * SINGLE_AI_ENTRY    = YES — GlobalAssistantDock only
 *
 * Flow:
 *   GlobalAssistantDock → AI Core → Structured Actions → Tool Gateway → JOS / Business Services
 *
 * Ownership:
 *   AI/UI shell  = conversation + action dispatch (no authoritative journey/commercial state)
 *   JOS          = journey instances, steps, resume
 *   Business Svc = service requests, quotes, payments
 *
 * Route context  = presentation only
 * JOS context    = authoritative journey context
 */

export const GLOBAL_ASSISTANT_SCOPE = 'PLATFORM_WIDE' as const;
export const GLOBAL_ASSISTANT_POSITION = 'PERSISTENT_BOTTOM' as const;

/** Context modes (UX policy — full resolver in future phases). */
export type GlobalAssistantMode = 'GUIDE' | 'NAVIGATOR' | 'OPERATOR' | 'MINIMAL';

export { ASSISTANT_EXCLUDED_PATH_PREFIXES, isAssistantVisible } from '@/config/assistant';
