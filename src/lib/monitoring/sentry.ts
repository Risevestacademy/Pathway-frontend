import * as Sentry from "@sentry/react";
import { isAxiosError, isCancel } from "axios";

const isEnabled =
  import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLE_DEV === "true";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn || !isEnabled) {
    return;
  }

  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    tracesSampleRate: 0,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpBodies: [],
      httpHeaders: {
        request: { deny: ["authorization", "cookie"] },
        response: false,
      },
    },

    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "AbortError",
    ],

    denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],
  });
}

export function setSentryUser(userId: string) {
  Sentry.setUser({ id: userId });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

export function captureApiError(
  error: unknown,
  context: {
    method?: string;
    url?: string;
    status?: number;
    category: string;
  },
) {
  Sentry.withScope((scope) => {
    scope.setTag("error.category", context.category);
    if (context.status !== undefined) {
      scope.setTag("http.status_code", String(context.status));
    }
    scope.setContext("request", context);
    Sentry.captureException(error);
  });
}

export function captureErrorResponse(error: unknown) {
  if (isCancel(error)) return;

  if (isAxiosError(error)) {
    if (
      error.response?.status === undefined ||
      error.response?.status >= 500 ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      captureApiError(error, {
        category: error.response
          ? "http_error"
          : error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
            ? "timeout"
            : "network_error",
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
      });
    }
  }
}

export async function withLoaderErrorReporting<T>(
  loader: () => Promise<T>,
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    captureErrorResponse(error);
    throw error;
  }
}
