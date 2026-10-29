import { beforeEach, describe, expect, it, vi } from "vitest";

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthog }));

const properties = {
  career_id: "career-1",
  title: "Software Engineer",
  timestamp: "2026-10-26T00:00:00.000Z",
  interest: "technology",
  levels: [],
};

// The module keeps the loaded client, so each test starts from a fresh copy.
async function loadEvents() {
  vi.resetModules();
  return import("./events");
}

describe("analytics.track", () => {
  beforeEach(() => {
    posthog.init.mockClear();
    posthog.capture.mockClear();
  });

  it("does nothing when analytics was never started", async () => {
    const { analytics } = await loadEvents();

    analytics.track("career_detail_viewed", properties);

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("does not load PostHog without a project token", async () => {
    const { analytics, initAnalytics } = await loadEvents();

    await initAnalytics(undefined, {});
    analytics.track("career_detail_viewed", properties);

    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("queues events sent while PostHog loads and sends them once it has", async () => {
    const { analytics, initAnalytics } = await loadEvents();

    const loading = initAnalytics("token", { api_host: "https://ph.test" });
    analytics.track("career_detail_viewed", properties);
    expect(posthog.capture).not.toHaveBeenCalled();

    await loading;

    expect(posthog.init).toHaveBeenCalledWith("token", {
      api_host: "https://ph.test",
    });
    expect(posthog.capture).toHaveBeenCalledWith(
      "career_detail_viewed",
      properties,
    );
  });

  it("sends the event straight away once PostHog is loaded", async () => {
    const { analytics, initAnalytics } = await loadEvents();
    await initAnalytics("token", {});

    analytics.track("career_detail_viewed", properties);

    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledTimes(1);
  });
});
