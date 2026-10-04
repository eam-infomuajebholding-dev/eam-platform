/** Guided multi-step journeys inside the homepage / global assistant composer. */
export const ASSISTANT_GUIDED_JOURNEY_ENABLED = false;

/** Routes where the fixed assistant dock should not appear. */
export const ASSISTANT_EXCLUDED_PATH_PREFIXES = ['/admin', '/auth/', '/command-center', '/payment/'];

export function isAssistantVisible(pathname: string): boolean {
  return !ASSISTANT_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}
