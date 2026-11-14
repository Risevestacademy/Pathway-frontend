import type { CaptureResult } from "posthog-js";
import { redactDeep } from "./redact";

export const analyticsOptions = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  capture_pageview: "history_change",
  defaults: "2026-05-30",
  debug: import.meta.env.DEV,
  before_send: (event: CaptureResult | null) => (event ? redactDeep(event) : event),
} as const;
