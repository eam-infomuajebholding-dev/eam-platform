/** Session-scoped token storage (preferred over localStorage for XSS resilience). */

const TOKEN_KEY = 'token';
const LEGACY_LOGOUT_KEY = 'isLougOutManual';

export function getStoredAuthToken(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const sessionToken = window.sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken?.trim()) {
      return sessionToken.trim();
    }
    const legacy = window.localStorage.getItem(TOKEN_KEY);
    if (legacy?.trim()) {
      window.sessionStorage.setItem(TOKEN_KEY, legacy.trim());
      window.localStorage.removeItem(TOKEN_KEY);
      return legacy.trim();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function persistAuthToken(token: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(LEGACY_LOGOUT_KEY, 'false');
    return true;
  } catch {
    return false;
  }
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(LEGACY_LOGOUT_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export function stripTokenFromBrowserUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  if (!url.searchParams.has('token')) {
    return;
  }
  url.searchParams.delete('token');
  url.searchParams.delete('expires_at');
  url.searchParams.delete('token_type');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}
