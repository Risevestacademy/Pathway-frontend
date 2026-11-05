import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useAuthStore } from "../../../lib/stores/authStore";
import { resetResourceTicksMemory } from "../resourceTicks.store";
import { useResourceTicks } from "./useResourceTicks";

const signInAs = (id: string) =>
  act(() => {
    useAuthStore.getState().setAuth({ id, email: `${id}@b.c`, role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });

beforeEach(() => {
  window.localStorage.clear();
  resetResourceTicksMemory();
  signInAs("u1");
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

describe("useResourceTicks", () => {
  it("starts with nothing ticked", () => {
    const { result } = renderHook(() => useResourceTicks("c1"));

    expect(result.current.isTicked("r1")).toBe(false);
    expect(result.current.countTicked(["r1", "r2"])).toBe(0);
  });

  it("ticks and unticks a resource", () => {
    const { result } = renderHook(() => useResourceTicks("c1"));

    act(() => result.current.toggle("r1"));
    expect(result.current.isTicked("r1")).toBe(true);

    act(() => result.current.toggle("r1"));
    expect(result.current.isTicked("r1")).toBe(false);
  });

  it("counts how many of some resources are ticked, ignoring ticks elsewhere", () => {
    const { result } = renderHook(() => useResourceTicks("c1"));

    act(() => result.current.toggle("r1"));
    act(() => result.current.toggle("other"));

    expect(result.current.countTicked(["r1", "r2"])).toBe(1);
  });

  it("shares ticks between everything that shows them", () => {
    const first = renderHook(() => useResourceTicks("c1"));
    const second = renderHook(() => useResourceTicks("c1"));

    act(() => first.result.current.toggle("r1"));

    expect(second.result.current.isTicked("r1")).toBe(true);
  });

  it("keeps ticks for each career apart", () => {
    const one = renderHook(() => useResourceTicks("c1"));
    const two = renderHook(() => useResourceTicks("c2"));

    act(() => one.result.current.toggle("r1"));

    expect(two.result.current.isTicked("r1")).toBe(false);
  });

  describe("when the browser won't save", () => {
    const blockSaving = () =>
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });

    it("has no unsaved ticks while saving works", () => {
      const { result } = renderHook(() => useResourceTicks("c1"));

      act(() => result.current.toggle("r1"));

      expect(result.current.unsaved).toEqual([]);
      expect(result.current.isUnsaved("r1")).toBe(false);
    });

    it("lists the ticks it couldn't save, and says whether a resource's is one", () => {
      blockSaving();
      const { result } = renderHook(() => useResourceTicks("c1"));

      act(() => result.current.toggle("r1"));
      act(() => result.current.toggle("r2"));

      expect(result.current.isTicked("r1")).toBe(true);
      expect(result.current.unsaved).toEqual(["r1", "r2"]);
      expect(result.current.isUnsaved("r2")).toBe(true);
      expect(result.current.isUnsaved("other")).toBe(false);
    });

    it("saves them when asked to try again once the browser allows it", () => {
      const blocked = blockSaving();
      const { result } = renderHook(() => useResourceTicks("c1"));
      act(() => result.current.toggle("r1"));
      blocked.mockRestore();

      act(() => {
        result.current.retry();
      });

      expect(result.current.unsaved).toEqual([]);
    });

    it("keeps them unsaved when trying again still can't save", () => {
      blockSaving();
      const { result } = renderHook(() => useResourceTicks("c1"));
      act(() => result.current.toggle("r1"));

      act(() => {
        result.current.retry();
      });

      expect(result.current.unsaved).toEqual(["r1"]);
    });
  });

  it("keeps ticks for each signed-in person apart", () => {
    const { result } = renderHook(() => useResourceTicks("c1"));
    act(() => result.current.toggle("r1"));

    signInAs("u2");

    expect(result.current.isTicked("r1")).toBe(false);
  });
});
