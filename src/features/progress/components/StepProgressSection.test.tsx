import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, screen } from "@testing-library/react";
import type { ActivePathwayDto, SavedPathwayDto } from "../../../lib/api/progress.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import {
  CAREER_ID,
  OTHER_CAREER_ID,
  activePathway,
  noActivePathway,
  savedPathway,
} from "../../../test/fixtures/progress.fixture";
import { renderWithRouter, stubDialog } from "../../../test/renderWithRouter";
import StepProgressSection from "./StepProgressSection";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  stubDialog();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});
afterAll(() => server.close());

function signIn() {
  useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
  useAuthStore.getState().finishHydrating();
}

function respondWith(active: ActivePathwayDto, saved: SavedPathwayDto[]) {
  server.use(
    http.get("*/me/active-pathway", () => HttpResponse.json(active)),
    http.get("*/me/pathways", () => HttpResponse.json(saved)),
  );
}

function renderSection(stepId = "s2") {
  return renderWithRouter(
    () => (
      <StepProgressSection
        careerId={CAREER_ID}
        careerTitle="Frontend Developer"
        stepId={stepId}
        stepTitle="CSS"
      />
    ),
    { path: `/careers/${CAREER_ID}/roadmap/${stepId}` },
  );
}

describe("StepProgressSection", () => {
  it("asks signed-out users to sign in once the session check finds nothing", async () => {
    server.use(
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );
    await renderSection();

    const link = await screen.findByRole("link", { name: "Sign in" });
    expect(link.getAttribute("href")).toBe(
      `/login?redirect=${encodeURIComponent(`/careers/${CAREER_ID}/roadmap/s2`)}`,
    );
  });

  it("offers Start tracking for a career the user hasn't saved", async () => {
    signIn();
    respondWith(noActivePathway, []);
    await renderSection();

    expect(await screen.findByRole("button", { name: "Start tracking" })).toBeTruthy();
    expect(screen.getByText("Save this roadmap to mark steps done as you go.")).toBeTruthy();
  });

  it("offers Make active for a saved pathway that isn't the active one", async () => {
    signIn();
    respondWith(activePathway(OTHER_CAREER_ID), [
      savedPathway(CAREER_ID, false),
      savedPathway(OTHER_CAREER_ID, true),
    ]);
    await renderSection();

    expect(await screen.findByRole("button", { name: "Make active" })).toBeTruthy();
  });

  it("flags the suggested next step and offers to mark it done", async () => {
    signIn();
    respondWith(activePathway(CAREER_ID), [savedPathway(CAREER_ID, true)]);
    await renderSection("s2");

    expect(await screen.findByRole("button", { name: "Mark this step done" })).toBeTruthy();
    expect(screen.getByText("This is your suggested next step.")).toBeTruthy();
    expect(screen.getByText(/self-reported/i)).toBeTruthy();
  });

  it("shows a completed step as done with a way to undo it", async () => {
    signIn();
    respondWith(activePathway(CAREER_ID), [savedPathway(CAREER_ID, true)]);
    await renderSection("s1");

    expect(await screen.findByText("You marked this step done")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mark as not done" })).toBeTruthy();
    expect(screen.queryByText("This is your suggested next step.")).toBeNull();
  });

  it("shows a retry when progress can't be loaded", async () => {
    signIn();
    server.use(
      http.get("*/me/active-pathway", () => HttpResponse.json({}, { status: 403 })),
      http.get("*/me/pathways", () => HttpResponse.json([])),
    );
    await renderSection();

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /couldn’t load your progress for this step/i,
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
