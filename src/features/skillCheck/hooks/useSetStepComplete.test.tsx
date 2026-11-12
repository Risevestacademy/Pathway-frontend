import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AxiosError, type AxiosResponse } from "axios";
import { httpStatus } from "../../../lib/api/progressErrors";
import { queryKeys } from "../../../lib/queryKeys";
import { useSetStepComplete } from "./useRoadmapPreview";

const setStepStatus = vi.fn();
const setStepComplete = vi.fn();
const activateOnServer = vi.fn();

vi.mock("../../../lib/api/progress.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/progress.api")>()),
  setStepStatus: (...args: unknown[]) => setStepStatus(...args),
}));
vi.mock("../../../lib/api/roadmapPreview.api", () => ({
  fetchCompletedSteps: vi.fn(),
  setStepComplete: (...args: unknown[]) => setStepComplete(...args),
}));
vi.mock("./activePathwaySync", () => ({
  activateOnServer: (...args: unknown[]) => activateOnServer(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => useSetStepComplete("frontend-developer"), { wrapper }), invalidate, queryClient };
}

/** A failed request the server answered with `status`. */
const answered = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
    data: {},
    statusText: "",
    headers: {},
    config: {},
  } as AxiosResponse);

const notSaved = () => answered(409);

describe("useSetStepComplete", () => {
  it("tells the server first, then records it in My Pathway, and refreshes the dashboard", async () => {
    const order: string[] = [];
    setStepStatus.mockImplementation(async () => {
      order.push("server");
    });
    setStepComplete.mockImplementation(async () => {
      order.push("local");
      return [1];
    });
    const { result, invalidate, queryClient } = setup();

    result.current.mutate({ stepOrder: 1, complete: true, realStepId: "step-uuid" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(order).toEqual(["server", "local"]);
    expect(setStepStatus).toHaveBeenCalledWith("step-uuid", "COMPLETED");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.progress.all });
    expect(queryClient.getQueryData(queryKeys.roadmapPreview("anonymous", "frontend-developer"))).toEqual([1]);
  });

  it("clears the step on the server with NOT_STARTED", async () => {
    setStepStatus.mockResolvedValue(undefined);
    setStepComplete.mockResolvedValue([]);
    const { result } = setup();

    result.current.mutate({ stepOrder: 1, complete: false, realStepId: "step-uuid" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStepStatus).toHaveBeenCalledWith("step-uuid", "NOT_STARTED");
  });

  it("only records it in My Pathway for a step with no real counterpart", async () => {
    setStepComplete.mockResolvedValue([2]);
    const { result, invalidate } = setup();

    result.current.mutate({ stepOrder: 2, complete: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStepStatus).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("changes nothing in My Pathway when the server refuses", async () => {
    setStepStatus.mockRejectedValue(answered(404));
    const { result } = setup();

    result.current.mutate({ stepOrder: 1, complete: true, realStepId: "step-uuid" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(httpStatus(result.current.error)).toBe(404);
    expect(setStepComplete).not.toHaveBeenCalled();
    expect(activateOnServer).not.toHaveBeenCalled();
  });

  it("saves the career and tries again, once, when the server says it isn't saved", async () => {
    setStepStatus.mockRejectedValueOnce(notSaved()).mockResolvedValueOnce(undefined);
    activateOnServer.mockResolvedValue(true);
    setStepComplete.mockResolvedValue([1]);
    const { result } = setup();

    result.current.mutate({ stepOrder: 1, complete: true, realStepId: "step-uuid" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(activateOnServer).toHaveBeenCalledWith(expect.anything(), "frontend-developer");
    expect(setStepStatus).toHaveBeenCalledTimes(2);
    expect(setStepComplete).toHaveBeenCalledTimes(1);
  });

  it("gives up, changing nothing here, if the second try is refused too", async () => {
    setStepStatus.mockRejectedValue(notSaved());
    activateOnServer.mockResolvedValue(false);
    const { result } = setup();

    result.current.mutate({ stepOrder: 1, complete: true, realStepId: "step-uuid" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setStepStatus).toHaveBeenCalledTimes(2);
    expect(setStepComplete).not.toHaveBeenCalled();
  });
});
