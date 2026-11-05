import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("keeps ticks for each signed-in person apart", () => {
    const { result } = renderHook(() => useResourceTicks("c1"));
    act(() => result.current.toggle("r1"));

    signInAs("u2");

    expect(result.current.isTicked("r1")).toBe(false);
  });
});
