/** M1 conversational journey inside the assistant. Other sectors stay on their pages. */
export const ASSISTANT_GUIDED_JOURNEY_ENABLED = true;
export const ASSISTANT_GUIDED_JOURNEY_TYPE = 'build_villa';

/** Routes where the fixed assistant dock should not appear. */
export const ASSISTANT_EXCLUDED_PATH_PREFIXES = ['/admin', '/auth/', '/command-center', '/payment/'];

export function isAssistantVisible(pathname: string): boolean {
  return !ASSISTANT_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}
