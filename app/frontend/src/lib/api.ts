import axios, { type AxiosInstance, type Method } from 'axios';
import { authApi } from '@/features/auth/api/auth';
import { getStoredAuthToken } from '@/features/auth/utils/authTokenStorage';
import { getAPIBaseURL } from '@/lib/config';

type ApiResponse<T = unknown> = {
  data: T;
  status: number;
};

type InvokeArgs = {
  url: string;
  method?: string;
  data?: unknown;
};

type EntityQueryArgs = {
  query?: Record<string, unknown>;
  limit?: number;
  skip?: number;
  sort?: string;
};

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const token = getStoredAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function createHttpClient(): AxiosInstance {
  return axios.create({
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function resolveUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  // In the browser, same-origin relative `/api` avoids localhost vs 127.0.0.1 mismatches
  // and always routes through the Vite dev proxy when present.
  if (typeof window !== 'undefined') {
    return url;
  }
  return `${getAPIBaseURL()}${url}`;
}

function buildEntityApi(entity: string) {
  const basePath = `/api/v1/entities/${entity}`;

  return {
    async query(args?: EntityQueryArgs): Promise<ApiResponse> {
      const params = new URLSearchParams();
      if (args?.query) {
        params.set('query', JSON.stringify(args.query));
      }
      if (args?.limit != null) {
        params.set('limit', String(args.limit));
      }
      if (args?.skip != null) {
        params.set('skip', String(args.skip));
      }
      if (args?.sort) {
        params.set('sort', args.sort);
      }

      const queryString = params.toString();
      const response = await createHttpClient().get(
        resolveUrl(`${basePath}${queryString ? `?${queryString}` : ''}`),
        { headers: getAuthHeaders() },
      );
      return { data: response.data, status: response.status };
    },

    async create(args: { data: Record<string, unknown> }): Promise<ApiResponse> {
      const response = await createHttpClient().post(resolveUrl(basePath), args.data, {
        headers: getAuthHeaders(),
      });
      return { data: response.data, status: response.status };
    },

    async update(args: { id: string | number; data: Record<string, unknown> }): Promise<ApiResponse> {
      const response = await createHttpClient().put(resolveUrl(`${basePath}/${args.id}`), args.data, {
        headers: getAuthHeaders(),
      });
      return { data: response.data, status: response.status };
    },

    async delete(args: { id: string | number }): Promise<ApiResponse> {
      const response = await createHttpClient().delete(resolveUrl(`${basePath}/${args.id}`), {
        headers: getAuthHeaders(),
      });
      return { data: response.data, status: response.status };
    },
  };
}

function buildFromApi(entity: string) {
  const entityApi = buildEntityApi(entity);

  return {
    query: () => entityApi.query(),
    create: (data: Record<string, unknown>) => entityApi.create({ data }),
    update: (id: string | number, data: Record<string, unknown>) => entityApi.update({ id, data }),
    delete: (id: string | number) => entityApi.delete({ id }),
  };
}

async function uploadToStorage(args: {
  bucket_name: string;
  object_key: string;
  file: File;
}): Promise<ApiResponse<{ download_url?: string; upload_url?: string }>> {
  const http = createHttpClient();
  const headers = getAuthHeaders();

  const uploadUrlResponse = await http.post(
    resolveUrl('/api/v1/storage/upload-url'),
    { bucket_name: args.bucket_name, object_key: args.object_key },
    { headers },
  );

  const uploadUrl = uploadUrlResponse.data.upload_url as string;
  await http.put(uploadUrl, args.file, {
    headers: { 'Content-Type': args.file.type || 'application/octet-stream' },
  });

  const downloadUrlResponse = await http.post(
    resolveUrl('/api/v1/storage/download-url'),
    { bucket_name: args.bucket_name, object_key: args.object_key },
    { headers },
  );

  return {
    data: {
      upload_url: uploadUrl,
      download_url: downloadUrlResponse.data.download_url as string | undefined,
    },
    status: 200,
  };
}

function buildStorageApi() {
  return {
    upload: uploadToStorage,
    getDownloadUrl: async (args: { bucket_name: string; object_key: string }): Promise<ApiResponse> => {
      const response = await createHttpClient().post(resolveUrl('/api/v1/storage/download-url'), args, {
        headers: getAuthHeaders(),
      });
      return { data: response.data, status: response.status };
    },
    from: (bucketName: string) => ({
      upload: async (objectKey: string, file: File) => {
        const result = await uploadToStorage({
          bucket_name: bucketName,
          object_key: objectKey,
          file,
        });
        return { url: result.data.download_url };
      },
    }),
  };
}

const entityCache = new Map<string, ReturnType<typeof buildEntityApi>>();

function getEntityApi(entity: string) {
  const cached = entityCache.get(entity);
  if (cached) {
    return cached;
  }

  const api = buildEntityApi(entity);
  entityCache.set(entity, api);
  return api;
}

export const client = {
  apiCall: {
    invoke: async ({ url, method = 'GET', data }: InvokeArgs): Promise<ApiResponse> => {
      const response = await createHttpClient().request({
        url: resolveUrl(url),
        method: method as Method,
        data,
        headers: getAuthHeaders(),
      });
      return { data: response.data, status: response.status };
    },
  },
  auth: {
    toLogin: (returnTo?: string | null) => {
      authApi.login(returnTo);
    },
    toRegister: (returnTo?: string | null) => {
      authApi.register(returnTo);
    },
  },
  entities: new Proxy({} as Record<string, ReturnType<typeof buildEntityApi>>, {
    get(_target, prop: string) {
      return getEntityApi(prop);
    },
  }),
  from: buildFromApi,
  storage: buildStorageApi(),
};

export function createClient() {
  return client;
}
