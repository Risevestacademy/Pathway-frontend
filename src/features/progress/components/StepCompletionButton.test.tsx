import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ActivePathwayDto } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import StepCompletionButton from "./StepCompletionButton";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clearAuth();
});
afterAll(() => server.close());

const progress = {
  completed: 0,
  total: 2,
  percentage: 0,
  nextStepId: "s1",
  selfReported: true,
  startStepId: null,
};

const active: ActivePathwayDto = {
  career: { id: "c1", slug: "fe", title: "Frontend", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Frontend" },
  progress,
  steps: [
    { id: "s1", order: 1, title: "HTML", skills: [], status: "NOT_STARTED" },
    { id: "s2", order: 2, title: "CSS", skills: [], status: "NOT_STARTED" },
  ],
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
  queryClient.setQueryData(queryKeys.progress.active("u1"), active);
});

function renderButton(
  status: "COMPLETED" | "NOT_STARTED" = "NOT_STARTED",
  extra: { variant?: "compact" | "full" | "primary"; onCompleted?: () => void } = {},
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <StepCompletionButton stepId="s1" stepTitle="HTML" status={status} {...extra} />
    </QueryClientProvider>,
  );
}

describe("StepCompletionButton", () => {
  it("saves COMPLETED and folds the server's progress into the cache", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.put("*/me/pathway-steps/s1", async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({
          stepId: "s1",
          status: "COMPLETED",
          progress: { ...progress, completed: 1, percentage: 50, nextStepId: "s2" },
        });
      }),
      http.get("*/me/*", () => HttpResponse.json({}, { status: 500 })),
    );
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /mark done/i }));

    await waitFor(() => expect(bodies).toEqual([{ status: "COMPLETED" }]));
    await waitFor(() => {
      const cached = queryClient.getQueryData<ActivePathwayDto>(
        queryKeys.progress.active("u1"),
      );
      expect(cached?.steps[0].status).toBe("COMPLETED");
      expect(cached?.progress?.completed).toBe(1);
    });
  });

  it("keeps the step not done when the save fails, and retries the same status", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.put("*/me/pathway-steps/s1", async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /mark done/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("still marked not done");
    expect(screen.getByRole("button", { name: /mark done/i })).toBeTruthy();
    expect(
      queryClient.getQueryData<ActivePathwayDto>(queryKeys.progress.active("u1"))
        ?.steps[0].status,
    ).toBe("NOT_STARTED");

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() =>
      expect(bodies).toEqual([{ status: "COMPLETED" }, { status: "COMPLETED" }]),
    );
  });

  it("sends NOT_STARTED to undo a completed step", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.put("*/me/pathway-steps/s1", async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ stepId: "s1", status: "NOT_STARTED", progress });
      }),
      http.get("*/me/*", () => HttpResponse.json({}, { status: 500 })),
    );
    renderButton("COMPLETED");

    await userEvent.click(screen.getByRole("button", { name: /done: html/i }));

    await waitFor(() => expect(bodies).toEqual([{ status: "NOT_STARTED" }]));
  });

  describe("the primary variant", () => {
    const saves = () =>
      http.put("*/me/pathway-steps/s1", async () =>
        HttpResponse.json({
          stepId: "s1",
          status: "COMPLETED",
          progress: { ...progress, completed: 1, percentage: 50, nextStepId: "s2" },
        }),
      );

    it("is a primary button that marks the step complete", async () => {
      const bodies: unknown[] = [];
      server.use(
        http.put("*/me/pathway-steps/s1", async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json({ stepId: "s1", status: "COMPLETED", progress });
        }),
        http.get("*/me/*", () => HttpResponse.json({}, { status: 500 })),
      );
      renderButton("NOT_STARTED", { variant: "primary" });

      const button = screen.getByRole("button", { name: "Mark step complete" });
      expect(button.className).toContain("bg-brand-600");
      await userEvent.click(button);

      await waitFor(() => expect(bodies).toEqual([{ status: "COMPLETED" }]));
    });

    it("says the step is complete once it has been saved", async () => {
      server.use(saves(), http.get("*/me/*", () => HttpResponse.json({}, { status: 500 })));
      const onCompleted = vi.fn();
      renderButton("NOT_STARTED", { variant: "primary", onCompleted });

      await userEvent.click(screen.getByRole("button", { name: "Mark step complete" }));

      await waitFor(() => expect(onCompleted).toHaveBeenCalledOnce());
    });

    it("doesn't say so when the save fails", async () => {
      server.use(http.put("*/me/pathway-steps/s1", () => HttpResponse.json({}, { status: 500 })));
      const onCompleted = vi.fn();
      renderButton("NOT_STARTED", { variant: "primary", onCompleted });

      await userEvent.click(screen.getByRole("button", { name: "Mark step complete" }));

      await screen.findByRole("alert");
      expect(onCompleted).not.toHaveBeenCalled();
    });

    it("shows a small Undo in the primary colour, not the primary button, for a step already complete", () => {
      renderButton("COMPLETED", { variant: "primary" });

      expect(screen.queryByRole("button", { name: "Mark step complete" })).toBeNull();
      expect(screen.getByText("You marked this step complete.")).toBeTruthy();
      const undo = screen.getByRole("button", { name: /undo/i });
      expect(undo.textContent).toContain("Undo");
      expect(undo.className).toContain("text-brand-700");
      expect(undo.className).toContain("text-sm");
    });

    it("names what Undo undoes, for screen readers", () => {
      renderButton("COMPLETED", { variant: "primary" });

      expect(screen.getByRole("button", { name: "Undo marking HTML complete" })).toBeTruthy();
    });

    it("marks the step not complete again when Undo is chosen, without saying it was completed", async () => {
      const bodies: unknown[] = [];
      server.use(
        http.put("*/me/pathway-steps/s1", async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json({ stepId: "s1", status: "NOT_STARTED", progress });
        }),
        http.get("*/me/*", () => HttpResponse.json({}, { status: 500 })),
      );
      const onCompleted = vi.fn();
      renderButton("COMPLETED", { variant: "primary", onCompleted });

      await userEvent.click(screen.getByRole("button", { name: /undo/i }));

      await waitFor(() => expect(bodies).toEqual([{ status: "NOT_STARTED" }]));
      await waitFor(() => expect(screen.getByRole("status").textContent).toContain("marked not done"));
      expect(onCompleted).not.toHaveBeenCalled();
    });

    it("keeps the step complete and offers to try again when undoing can't be saved", async () => {
      server.use(http.put("*/me/pathway-steps/s1", () => HttpResponse.json({}, { status: 500 })));
      renderButton("COMPLETED", { variant: "primary" });

      await userEvent.click(screen.getByRole("button", { name: /undo/i }));

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain("still marked done");
      expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
    });
  });
});
