import { client } from '@/lib/api';

export type AuthConfigResponse = {
  oidc_configured: boolean;
  login_path: string;
  register_path: string;
  provider_label: string;
  uses_pkce: boolean;
};

export async function fetchAuthConfig(): Promise<AuthConfigResponse> {
  const response = await client.apiCall.invoke({
    url: '/api/v1/auth/config',
    method: 'GET',
  });
  return response.data as AuthConfigResponse;
}
