import { beforeEach, describe, expect, it } from "vitest";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "./analyticsConsent";

beforeEach(() => {
  window.localStorage.clear();
});

describe("analytics consent", () => {
  it("starts unset", () => {
    expect(getAnalyticsConsent()).toBeNull();
  });

  it.each<AnalyticsConsent>(["accepted", "declined"])("persists %s", (consent) => {
    setAnalyticsConsent(consent);

    expect(getAnalyticsConsent()).toBe(consent);
  });

  it("treats an unknown stored value as unset", () => {
    window.localStorage.setItem("pathway.analytics-consent.v1", "unknown");

    expect(getAnalyticsConsent()).toBeNull();
  });
});
