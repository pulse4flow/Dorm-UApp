const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
};
