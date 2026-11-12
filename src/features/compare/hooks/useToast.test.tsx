import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import Toast from "../components/Toast";
import { useToast } from "./useToast";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useToast", () => {
  it("shows a message, fades it, then removes it", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeNull();

    act(() => result.current.show("Hello"));
    expect(result.current.toast).toMatchObject({ message: "Hello", open: true });

    act(() => void vi.advanceTimersByTime(3500));
    expect(result.current.toast).toMatchObject({ message: "Hello", open: false });

    act(() => void vi.advanceTimersByTime(200));
    expect(result.current.toast).toBeNull();
  });

  it("replaces a message with a newer one and restarts the timer", () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.show("First"));
    act(() => void vi.advanceTimersByTime(3000));
    act(() => result.current.show("Second"));
    act(() => void vi.advanceTimersByTime(1000));

    expect(result.current.toast).toMatchObject({ message: "Second", open: true });
  });

  it("gives a repeated message a new id, so it is announced again", () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.show("Same"));
    const first = result.current.toast?.id;
    act(() => result.current.show("Same"));

    expect(result.current.toast?.id).not.toBe(first);
  });

  it("clears its timers when the screen goes away", () => {
    const { result, unmount } = renderHook(() => useToast());
    act(() => result.current.show("Bye"));
    unmount();

    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });
});

describe("Toast", () => {
  it("keeps its live region mounted and empty when there is no message", () => {
    render(<Toast toast={null} />);

    const region = screen.getByRole("status");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toBe("");
  });

  it("shows the message inside the live region", () => {
    render(<Toast toast={{ id: 1, message: "Only two at a time", open: true }} />);

    expect(screen.getByRole("status").textContent).toBe("Only two at a time");
  });
});