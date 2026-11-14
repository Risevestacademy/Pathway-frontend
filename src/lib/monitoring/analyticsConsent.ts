const STORAGE_KEY = "pathway.analytics-consent.v1";

export type AnalyticsConsent = "accepted" | "declined";

export function getAnalyticsConsent(): AnalyticsConsent | null {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  window.localStorage.setItem(STORAGE_KEY, consent);
}
