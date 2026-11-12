import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ActivePathwayDto } from "../../../lib/api/progress.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import StartTrackingButton from "./StartTrackingButton";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  // <dialog> methods aren't implemented in jsdom.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clearAuth();
});
afterAll(() => server.close());

const active: ActivePathwayDto = {
  career: { id: "c1", slug: "fe", title: "Frontend", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Frontend" },
  progress: {
    completed: 0,
    total: 2,
    percentage: 0,
    nextStepId: "s1",
    selfReported: true,
    startStepId: null,
  },
  steps: [],
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
});

function renderButton(
  activeCareerTitle: string | null = null,
  onStarted?: () => void,
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <StartTrackingButton
        careerId="c1"
        careerTitle="Frontend"
        activeCareerTitle={activeCareerTitle}
        label="Start step 1"
        onStarted={onStarted}
      />
    </QueryClientProvider>,
  );
}

const saves = () => {
  const bodies: unknown[] = [];
  server.use(
    http.put("*/me/active-pathway", async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(active);
    }),
    http.get("*/me/*", () => HttpResponse.json({}, { status: 500 })),
  );
  return bodies;
};

describe("StartTrackingButton", () => {
  it("makes the career their active pathway, then says it is done", async () => {
    const bodies = saves();
    const onStarted = vi.fn();
    renderButton(null, onStarted);

    await userEvent.click(screen.getByRole("button", { name: "Start step 1" }));

    await waitFor(() => expect(onStarted).toHaveBeenCalledOnce());
    expect(bodies).toEqual([{ careerId: "c1" }]);
  });

  it("doesn't say it is done when the career couldn't be saved", async () => {
    server.use(http.put("*/me/active-pathway", () => HttpResponse.json({}, { status: 500 })));
    const onStarted = vi.fn();
    renderButton(null, onStarted);

    await userEvent.click(screen.getByRole("button", { name: "Start step 1" }));

    await screen.findByRole("alert");
    expect(onStarted).not.toHaveBeenCalled();
  });

  it("asks first when another pathway is active, and only then saves", async () => {
    const bodies = saves();
    const onStarted = vi.fn();
    renderButton("Data Analyst", onStarted);

    await userEvent.click(screen.getByRole("button", { name: "Start step 1" }));

    expect(await screen.findByText("Make Frontend your active pathway?")).toBeTruthy();
    expect(bodies).toEqual([]);

    await userEvent.click(screen.getByRole("button", { name: "Switch pathway" }));

    await waitFor(() => expect(onStarted).toHaveBeenCalledOnce());
    expect(bodies).toEqual([{ careerId: "c1" }]);
  });

  it("does nothing more when they cancel the switch", async () => {
    const bodies = saves();
    const onStarted = vi.fn();
    renderButton("Data Analyst", onStarted);

    await userEvent.click(screen.getByRole("button", { name: "Start step 1" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(bodies).toEqual([]);
    expect(onStarted).not.toHaveBeenCalled();
  });

  it("still works with nothing to do afterwards", async () => {
    const bodies = saves();
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: "Start step 1" }));

    await waitFor(() => expect(bodies).toEqual([{ careerId: "c1" }]));
  });
});
