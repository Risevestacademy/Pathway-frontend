import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryKeys } from "../../../lib/queryKeys";
import { useCreateCareer } from "./useCreateCareer";

const createAdminCareer = vi.fn();

vi.mock("../../../lib/api/adminCareers.api", () => ({
  createAdminCareer: (...args: unknown[]) => createAdminCareer(...args),
}));

afterEach(() => {
  cleanup();
  createAdminCareer.mockReset();
});

const input = {
  title: "DevOps Engineer",
  slug: "devops-engineer",
  fieldId: "f1",
  description: "Automates delivery.",
  roleSummary: "Builds pipelines.",
  targetLevels: ["STUDENT"],
};

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => useCreateCareer(), { wrapper }), invalidate };
}

describe("useCreateCareer", () => {
  it("refreshes the admin careers list, which includes drafts, once the career is created", async () => {
    createAdminCareer.mockResolvedValue({ id: "career-1" });
    const { result, invalidate } = setup();

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createAdminCareer).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.admin.careers.all });
  });

  it("leaves the list alone when creating fails", async () => {
    createAdminCareer.mockRejectedValue(new Error("Another career already has this title."));
    const { result, invalidate } = setup();

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
