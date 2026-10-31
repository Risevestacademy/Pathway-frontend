import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
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

function renderButton(status: "COMPLETED" | "NOT_STARTED" = "NOT_STARTED") {
  return render(
    <QueryClientProvider client={queryClient}>
      <StepCompletionButton stepId="s1" stepTitle="HTML" status={status} />
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
});
