import { useEffect, useState } from "react";
import { updateAnalyticsEnabled } from "../lib/api/users.api";
import { useAuthStore } from "../lib/stores/authStore";
import { analyticsOptions } from "../lib/monitoring/analyticsConfig";
import { initAnalytics } from "../lib/monitoring/events";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "../lib/monitoring/analyticsConsent";

/** Best effort: a failed save is retried at the next sign-in, while the browser keeps the choice. */
async function saveToAccount(enabled: boolean): Promise<void> {
  try {
    await updateAnalyticsEnabled(enabled);
  } catch {
    // Left for the next sign-in to retry.
  }
}

export function AnalyticsNotice() {
  const [answered, setAnswered] = useState(() => getAnalyticsConsent() !== null);

  const userId = useAuthStore((state) => state.user?.id ?? null);
  // A decline saved on the account from another device answers the question.
  const accountDeclined = useAuthStore((state) => state.user?.analyticsEnabled === false);

  // On sign-in, make the account match this browser's choice, or take on a
  // decline saved from another device. An account's "on" is only the server
  // default, so it never counts as consent.
  useEffect(() => {
    if (!userId) return;
    const accountEnabled = useAuthStore.getState().user?.analyticsEnabled;
    const consent = getAnalyticsConsent();

    if (consent) {
      if (accountEnabled !== (consent === "accepted")) {
        void saveToAccount(consent === "accepted");
      }
    } else if (accountEnabled === false) {
      setAnalyticsConsent("declined");
    }
  }, [userId]);

  if (answered || accountDeclined) return null;

  const choose = (consent: "accepted" | "declined") => {
    setAnalyticsConsent(consent);
    setAnswered(true);
    if (useAuthStore.getState().user) {
      void saveToAccount(consent === "accepted");
    }
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
