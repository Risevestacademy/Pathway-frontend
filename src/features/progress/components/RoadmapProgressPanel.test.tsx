import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ActivePathwayDto } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import {
  CAREER_ID,
  activePathway,
  pathwayProgress,
  roadmapSteps,
} from "../../../test/fixtures/progress.fixture";
import { renderWithRouter, stubDialog } from "../../../test/renderWithRouter";
import type { CareerProgress } from "../progress.types";
import RoadmapProgressPanel from "./RoadmapProgressPanel";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  stubDialog();
});
beforeEach(() => {
  useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clearAuth();
});
afterAll(() => server.close());

function renderPanel(progress: CareerProgress, onRetry = () => {}) {
  return renderWithRouter(
    () => (
      <RoadmapProgressPanel
        careerId={CAREER_ID}
        careerTitle="Frontend Developer"
        steps={roadmapSteps}
        progress={progress}
        onRetry={onRetry}
      />
    ),
    { path: `/careers/${CAREER_ID}/roadmap` },
  );
}

/** Records PUT /me/active-pathway bodies; the response makes CAREER_ID active. */
function captureStartTracking(status = 200) {
  const bodies: unknown[] = [];
  server.use(
    http.put("*/me/active-pathway", async ({ request }) => {
      bodies.push(await request.json());
      return status === 200
        ? HttpResponse.json(activePathway(CAREER_ID, {}))
        : HttpResponse.json({}, { status });
    }),
    http.get("*/me/pathways", () => HttpResponse.json([])),
  );
  return bodies;
}

describe("RoadmapProgressPanel", () => {
  it("asks signed-out users to sign in and come back to this roadmap", async () => {
    await renderPanel({ kind: "signed-out" });

    const link = screen.getByRole("link", { name: "Sign in" });
    expect(link.getAttribute("href")).toBe(
      `/login?redirect=${encodeURIComponent(`/careers/${CAREER_ID}/roadmap`)}`,
    );
  });

  it("shows a retry when progress fails to load", async () => {
    const onRetry = vi.fn();
    await renderPanel({ kind: "error" }, onRetry);

    expect(screen.getByRole("alert").textContent).toMatch(/couldn’t load your progress/i);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  describe("untracked", () => {
    it("starts tracking straight away when no other pathway is active", async () => {
      const bodies = captureStartTracking();
      const { queryClient } = await renderPanel({ kind: "untracked", activeCareerTitle: null });

      await userEvent.click(screen.getByRole("button", { name: "Start tracking" }));

      await waitFor(() => expect(bodies).toEqual([{ careerId: CAREER_ID }]));
      expect(screen.queryByRole("dialog")).toBeNull();
      await waitFor(() =>
        expect(
          queryClient.getQueryData<ActivePathwayDto>(queryKeys.progress.active("u1"))?.career?.id,
        ).toBe(CAREER_ID),
      );
    });

    it("asks before replacing another active pathway, and Cancel sends nothing", async () => {
      const bodies = captureStartTracking();
      await renderPanel({ kind: "untracked", activeCareerTitle: "Data Analyst" });

      await userEvent.click(screen.getByRole("button", { name: "Start tracking" }));

      const dialog = screen.getByRole("dialog", {
        name: "Make Frontend Developer your active pathway?",
      });
      expect(dialog.textContent).toContain("Your progress on Data Analyst stays saved");

      await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(bodies).toEqual([]);
    });

    it("switches on confirm and closes the dialog once saved", async () => {
      const bodies = captureStartTracking();
      await renderPanel({ kind: "untracked", activeCareerTitle: "Data Analyst" });

      await userEvent.click(screen.getByRole("button", { name: "Start tracking" }));
      await userEvent.click(screen.getByRole("button", { name: "Switch pathway" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(bodies).toEqual([{ careerId: CAREER_ID }]);
    });

    it("keeps the dialog open with an error when the switch fails", async () => {
      captureStartTracking(500);
      await renderPanel({ kind: "untracked", activeCareerTitle: "Data Analyst" });

      await userEvent.click(screen.getByRole("button", { name: "Start tracking" }));
      await userEvent.click(screen.getByRole("button", { name: "Switch pathway" }));

      const dialog = screen.getByRole("dialog");
      expect((await within(dialog).findByRole("alert")).textContent).toMatch(
        /couldn’t save this pathway/i,
      );
    });
  });

  it("shows saved counts for an inactive pathway and offers to make it active", async () => {
    captureStartTracking();
    await renderPanel({
      kind: "inactive",
      counts: { completed: 2, total: 5, percentage: 40 },
      activeCareerTitle: "Data Analyst",
    });

    expect(screen.getByText("2 of 5 steps complete")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("2");
    expect(screen.getByText(/Data Analyst is your active pathway right now/)).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Make active" }));
    expect(screen.getByRole("dialog", { name: /make frontend developer your active pathway/i })).toBeTruthy();
  });

  describe("active", () => {
    it("shows counts, the next step and the self-reported label", async () => {
      await renderPanel({
        kind: "active",
        progress: pathwayProgress(),
        statuses: { s1: "COMPLETED" },
      });

      expect(screen.getByText("1 of 3 steps complete")).toBeTruthy();
      expect(screen.getByText("33%")).toBeTruthy();
      const next = screen.getByRole("link", { name: /up next · step 2/i });
      expect(next.getAttribute("href")).toBe(`/careers/${CAREER_ID}/roadmap/s2`);
      expect(screen.getByText(/self-reported/i)).toBeTruthy();
    });

    it("says every step is done when nothing is left", async () => {
      await renderPanel({
        kind: "active",
        progress: pathwayProgress({ completed: 3, percentage: 100, nextStepId: null }),
        statuses: { s1: "COMPLETED", s2: "COMPLETED", s3: "COMPLETED" },
      });

      expect(screen.getByText("You’ve marked every step done.")).toBeTruthy();
      expect(screen.queryByRole("link", { name: /up next/i })).toBeNull();
    });

    it("explains that steps before the chosen start stay open", async () => {
      await renderPanel({
        kind: "active",
        progress: pathwayProgress({ completed: 0, nextStepId: "s3", startStepId: "s3" }),
        statuses: {},
      });

      expect(screen.getByRole("link", { name: /up next · step 3/i })).toBeTruthy();
      expect(screen.getByText(/You chose to start at step 3/)).toBeTruthy();
    });
  });
});
