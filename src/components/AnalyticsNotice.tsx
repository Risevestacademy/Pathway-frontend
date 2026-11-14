import { useState } from "react";
import { analyticsOptions } from "../lib/monitoring/analyticsConfig";
import { initAnalytics } from "../lib/monitoring/events";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "../lib/monitoring/analyticsConsent";

export function AnalyticsNotice() {
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null);

  if (!visible) return null;

  const choose = (consent: "accepted" | "declined") => {
    setAnalyticsConsent(consent);
    setVisible(false);
    if (consent === "accepted") {
      void initAnalytics(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, analyticsOptions);
    }
  };

  return (
    <aside
      role="dialog"
      aria-labelledby="analytics-notice-title"
      className="fixed right-4 bottom-4 z-40 w-[min(100%-2rem,360px)] rounded-3xl border border-line bg-surface p-5 shadow-overlay"
    >
      <h2 id="analytics-notice-title" className="font-display text-lg font-medium text-ink">
        Help us improve Pathway
      </h2>
      <p className="mt-2 text-sm leading-5 text-ink-muted">
        We count which pages people open and which buttons they use, without your name or
        anything you type. It tells us what to fix first. You can turn it off any time in
        Settings, Privacy and data.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="focus-ring flex-1 rounded-xl border border-grey-200 bg-surface px-3 py-2 text-sm font-medium text-grey-600"
          onClick={() => choose("declined")}
        >
          Turn it off
        </button>
        <button
          type="button"
          className="focus-ring flex-1 rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white"
          onClick={() => choose("accepted")}
        >
          Keep it on
        </button>
      </div>
    </aside>
  );
}
