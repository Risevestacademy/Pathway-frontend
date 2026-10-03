import * as Sentry from "@sentry/react";

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
