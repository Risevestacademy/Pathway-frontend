import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { AdminCareerRow } from "../admin.utils";
import { useAdminStore } from "../adminStore";
import { useDeleteCareer } from "./useDeleteCareer";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  useAdminStore.getState().reset();
});
afterAll(() => server.close());

const row = (id: string, over: Partial<AdminCareerRow> = {}): AdminCareerRow => ({
  id,
  title: `Career ${id}`,
  shortDescription: "",
  status: "draft",
  stepCount: 0,
  sources: null,
  updatedAt: null,
  ...over,
});

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
});

describe("useDeleteCareer", () => {
  it("removes a career created in the browser without calling the API", async () => {
    useAdminStore.getState().addCareer({ title: "Mine", shortDescription: "" });
    const local = useAdminStore.getState().created[0];
    // No handler is registered, so any request would fail the test.
    const { result } = renderHook(() => useDeleteCareer(), { wrapper });

    act(() => result.current.mutate({ ...local }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAdminStore.getState().created).toEqual([]);
  });

  it("deletes a server draft through the API, then forgets its local changes", async () => {
    let deleted = "";
    server.use(
      http.delete("*/admin/careers/abc", () => {
        deleted = "abc";
        return HttpResponse.json({ message: "Career deleted" });
      }),
    );
    useAdminStore.getState().setStatus("abc", "draft");
    const { result } = renderHook(() => useDeleteCareer(), { wrapper });

    act(() => result.current.mutate(row("abc")));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleted).toBe("abc");
    expect(useAdminStore.getState().statusOverrides).toEqual({});
  });

  it("keeps the local copy when the server refuses", async () => {
    server.use(
      http.delete("*/admin/careers/abc", () =>
        HttpResponse.json({ error: "CONFLICT" }, { status: 409 }),
      ),
    );
    useAdminStore.getState().setStatus("abc", "draft");
    const { result } = renderHook(() => useDeleteCareer(), { wrapper });

    act(() => result.current.mutate(row("abc")));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("never published");
    expect(useAdminStore.getState().statusOverrides).toEqual({ abc: "draft" });
  });
});
