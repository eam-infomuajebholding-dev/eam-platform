import axios, { AxiosInstance } from 'axios';
import { getAPIBaseURL } from '@/lib/config';

const WEB_SDK_TOKEN_STORAGE_KEY = 'token';

const WEB_SDK_LOGOUT_MANUAL_KEY = 'isLougOutManual';

function persistWebSdkToken(token: string): boolean {
  try {
    window.localStorage.setItem(WEB_SDK_TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(WEB_SDK_LOGOUT_MANUAL_KEY, 'false');
    return true;
  } catch {
    return false;
  }
}

function readCallbackToken(): string | undefined {
  const token = new URLSearchParams(window.location.search).get('token');
  return token?.trim() ? token : undefined;
}

function getWebSdkBearerToken(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const token = window.localStorage.getItem(WEB_SDK_TOKEN_STORAGE_KEY);
    return token?.trim() ? token : undefined;
  } catch {
    return undefined;
  }
}

class RPApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getBaseURL() {
    return getAPIBaseURL();
  }

  private authHeaders(): Record<string, string> {
    const token = getWebSdkBearerToken();
    if (!token) {
      return {};
    }

    return { Authorization: `Bearer ${token}` };
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get(`${this.getBaseURL()}/api/v1/auth/me`, {
        headers: this.authHeaders(),
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(
        error.response?.data?.detail || 'Failed to get user info'
      );
    }
  }

  async login() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/login`
      );
      // The backend will redirect to OIDC provider
      // SSO will work via cookies automatically
      window.location.href = response.data.redirect_url;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to initiate login'
      );
    }
  }

  async logout() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/logout`
      );
      // The backend will redirect to OIDC provider logout
      window.location.href = response.data.redirect_url;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to logout');
    }
  }
}

export const authApi = new RPApi();

export { persistWebSdkToken, readCallbackToken };
