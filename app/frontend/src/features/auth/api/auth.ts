import axios, { AxiosInstance } from 'axios';
import { getAPIBaseURL } from '@/lib/config';
import {
  clearAuthToken,
  getStoredAuthToken,
  persistAuthToken,
} from '@/features/auth/utils/authTokenStorage';
import { startAuthFlow } from '@/features/auth/utils/authStartUrl';

function readCallbackToken(): string | undefined {
  const token = new URLSearchParams(window.location.search).get('token');
  return token?.trim() ? token : undefined;
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
    const token = getStoredAuthToken();
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

  login(returnTo?: string | null) {
    startAuthFlow('login', returnTo);
  }

  register(returnTo?: string | null) {
    startAuthFlow('register', returnTo);
  }

  async logout() {
    clearAuthToken();
    try {
      const response = await this.client.get(`${this.getBaseURL()}/api/v1/auth/logout`);
      const redirectUrl = response.data?.redirect_url as string | undefined;
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }
    } catch {
      /* local session already cleared */
    }
    window.location.assign('/');
  }
}

export const authApi = new RPApi();

export function persistWebSdkToken(token: string): boolean {
  return persistAuthToken(token);
}

export { readCallbackToken };
