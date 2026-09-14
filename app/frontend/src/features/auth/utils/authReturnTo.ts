const RETURN_TO_KEY = 'eam-auth-return-to';

/** Persist post-login redirect (survives OIDC round-trip). */
export function saveAuthReturnTo(pathWithSearch: string): void {
  if (!pathWithSearch.startsWith('/') || pathWithSearch.startsWith('//')) {
    return;
  }
  try {
    sessionStorage.setItem(RETURN_TO_KEY, pathWithSearch);
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumeAuthReturnTo(): string | null {
  try {
    const value = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    if (!value?.startsWith('/') || value.startsWith('//')) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}
