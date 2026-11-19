import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchDashboard } from "./dashboard.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const body = {
  totals: { savedPathways: 1, completedSteps: 2, xp: 30, badgesEarned: 1, badgesTotal: 5 },
  streak: { current: 1, longest: 3 },
  weekStrip: { days: [{ date: "2026-11-10", active: true }], currentStreak: 1 },
  heatmap: { from: "2025-11-18", to: "2026-11-18", days: [{ date: "2026-11-10", count: 2 }] },
  badges: [],
  activePathway: null,
  currentProject: null,
  goals: [],
};

describe("fetchDashboard", () => {
  it("returns the dashboard payload", async () => {
    server.use(http.get("*/me/dashboard", () => HttpResponse.json(body)));
    await expect(fetchDashboard()).resolves.toEqual(body);
  });

  it("refreshes the session and retries when the access token is missing or invalid", async () => {
    let calls = 0;
    server.use(
      http.get("*/me/dashboard", () =>
        ++calls === 1 ? HttpResponse.json({}, { status: 401 }) : HttpResponse.json(body),
      ),
      http.post("*/auth/refresh", () => HttpResponse.json({ accessToken: "fresh" })),
    );

    await expect(fetchDashboard()).resolves.toEqual(body);
    expect(calls).toBe(2);
  });
});
