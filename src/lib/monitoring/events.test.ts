import { beforeEach, describe, expect, it, vi } from "vitest";

const posthog = vi.hoisted(() => ({
  __loaded: false,
  capture: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthog }));

import { analytics } from "./events";

describe("analytics.track", () => {
  beforeEach(() => {
    posthog.capture.mockClear();
  });

  it("does nothing when PostHog is not loaded", () => {
    analytics.track("career_viewed", {
      career_id: "career-1",
      title: "Software Engineer",
      timestamp: "2026-10-26T00:00:00.000Z",
      interest: "technology",
      levels: [],
    });

    expect(posthog.capture).not.toHaveBeenCalled();
  });
});
