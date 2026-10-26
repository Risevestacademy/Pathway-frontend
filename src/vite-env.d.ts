/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_POSTHOG_PROJECT_TOKEN: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_SENTRY_ENABLE_DEV?: string;
  readonly VITE_APP_VERSION?: string;
  /** Dev only: "true" skips the auth and admin-role route guards. */
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
