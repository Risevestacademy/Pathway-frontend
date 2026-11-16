const STORAGE_KEY = "pathway.analytics-consent.v1";

export type AnalyticsConsent = "accepted" | "declined";

export function getAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    // Storage is blocked: treat it as no choice yet.
    return null;
  }
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Storage is blocked: the choice applies to this visit only.
  }
}
