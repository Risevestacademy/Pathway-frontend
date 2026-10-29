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
  /** Email of the admin who is the only seeded person on the team list. */
  readonly VITE_ADMIN_OWNER_EMAIL?: string;
  /** That admin's full name. */
  readonly VITE_ADMIN_OWNER_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
