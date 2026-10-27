import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useResendCooldown } from "./useResendCooldown";

beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("useResendCooldown", () => {
  it("is free until a code is requested", () => {
    const { result } = renderHook(() => useResendCooldown(30));

    expect(result.current.remaining).toBe(0);
  });

  it("counts down after start, then frees up", () => {
    const { result } = renderHook(() => useResendCooldown(30));

    act(() => result.current.start());
    expect(result.current.remaining).toBe(30);

    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.remaining).toBe(20);

    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current.remaining).toBe(0);
  });

  it("carries over to another page that mounts during the wait", () => {
    const first = renderHook(() => useResendCooldown(30));
    act(() => first.result.current.start());
    first.unmount();

    act(() => vi.advanceTimersByTime(5_000));
    const second = renderHook(() => useResendCooldown(30));

    expect(second.result.current.remaining).toBe(25);
  });
});
