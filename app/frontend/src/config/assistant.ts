/** Routes where the fixed assistant dock should not appear. */
export const ASSISTANT_EXCLUDED_PATH_PREFIXES = ['/admin', '/auth/', '/command-center', '/payment/'];

export function isAssistantVisible(pathname: string): boolean {
  return !ASSISTANT_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}
