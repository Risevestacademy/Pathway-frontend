import axios from "axios";
import { useAuthStore } from "../stores/authStore";

declare module "axios" {
  interface AxiosRequestConfig {
    /**
     * A 401 from this request means bad credentials, not an expired session,
     * so the interceptor rejects it instead of refreshing. Set it on every
     * auth endpoint, and always on the refresh call itself.
     */
    skipAuthRefresh?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

interface RefreshResponse {
  accessToken: string;
}

interface WrappedRefreshResponse {
  data: RefreshResponse;
}

export async function refreshAccessToken(): Promise<string> {
  const { data } = await api.post<RefreshResponse | WrappedRefreshResponse>(
    "/auth/refresh",
    undefined,
    { skipAuthRefresh: true },
  );
  const response = "data" in data ? data.data : data;

  useAuthStore.getState().setAccessToken(response.accessToken);
  return response.accessToken;
}

let onSessionExpired: (() => void) | null = null;

/**
 * Called once the session can't be refreshed and auth has been cleared. The
 * app registers a router redirect here, which keeps the return path.
 */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;
    try {
      await refreshAccessToken();
      pendingRequests.forEach(({ resolve }) => resolve(undefined));
      pendingRequests = [];
      return api(originalRequest);
    } catch (refreshError) {
      pendingRequests.forEach(({ reject }) => reject(refreshError));
      pendingRequests = [];
      useAuthStore.getState().clearAuth();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function __resetAuthInterceptorState() {
  isRefreshing = false;
  pendingRequests = [];
  onSessionExpired = null;
}
