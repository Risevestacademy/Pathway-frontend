import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  describe("when browser storage is blocked", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("reads as unset instead of throwing", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });

      expect(getAnalyticsConsent()).toBeNull();
    });

    it("ignores a failed write instead of throwing", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });

      expect(() => setAnalyticsConsent("accepted")).not.toThrow();
    });
  });

  it("treats an unknown stored value as unset", () => {
    window.localStorage.setItem("pathway.analytics-consent.v1", "unknown");

    expect(getAnalyticsConsent()).toBeNull();
  });
});
