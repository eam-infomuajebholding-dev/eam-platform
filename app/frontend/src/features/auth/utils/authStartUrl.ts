import { getAPIBaseURL } from '@/lib/config';

export type AuthStartMode = 'login' | 'register';

/** Full-page navigation to backend OIDC entry (PKCE). Avoid axios — expect 302. */
export function buildAuthStartUrl(mode: AuthStartMode, returnTo?: string | null): string {
  const base = getAPIBaseURL().replace(/\/$/, '');
  const path = mode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
  const params = new URLSearchParams();
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
    params.set('return_to', returnTo);
  }
  const query = params.toString();
  return `${base}${path}${query ? `?${query}` : ''}`;
}

export function startAuthFlow(mode: AuthStartMode, returnTo?: string | null): void {
  window.location.assign(buildAuthStartUrl(mode, returnTo));
}
