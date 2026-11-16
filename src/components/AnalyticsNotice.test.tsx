import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AnalyticsNotice } from "./AnalyticsNotice";
import { useAuthStore } from "../lib/stores/authStore";

const { initAnalytics } = vi.hoisted(() => ({
  initAnalytics: vi.fn(() => Promise.resolve()),
}));

vi.mock("../lib/monitoring/events", () => ({
  initAnalytics,
}));

vi.mock("../lib/monitoring/analyticsConfig", () => ({
  analyticsOptions: {},
}));

const { updateAnalyticsEnabled } = vi.hoisted(() => ({
  updateAnalyticsEnabled: vi.fn(() => Promise.resolve()),
}));

vi.mock("../lib/api/users.api", () => ({
  updateAnalyticsEnabled,
}));

afterEach(cleanup);

function signIn(analyticsEnabled?: boolean) {
  useAuthStore.getState().setAuth(
    { id: "u1", email: "a@b.co", role: "USER", analyticsEnabled },
    "token",
  );
}

beforeEach(() => {
  window.localStorage.clear();
  initAnalytics.mockClear();
  updateAnalyticsEnabled.mockClear();
  useAuthStore.getState().clearAuth();
});

describe("AnalyticsNotice with blocked storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still renders, and hides for this visit once answered", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    render(<AnalyticsNotice />);
    fireEvent.click(screen.getByRole("button", { name: "Turn it off" }));

    expect(screen.queryByRole("dialog", { name: "Help us improve Pathway" })).toBeNull();
  });
});

describe("AnalyticsNotice account sync", () => {
  it("does not call the API when signed out", () => {
    render(<AnalyticsNotice />);

    fireEvent.click(screen.getByRole("button", { name: "Turn it off" }));

    expect(updateAnalyticsEnabled).not.toHaveBeenCalled();
  });

  it("saves a decline to the account when signed in", () => {
    signIn(true);
    render(<AnalyticsNotice />);

    fireEvent.click(screen.getByRole("button", { name: "Turn it off" }));

    expect(updateAnalyticsEnabled).toHaveBeenCalledWith(false);
  });

  it("saves an accept to the account when signed in", () => {
    signIn();
    render(<AnalyticsNotice />);

    fireEvent.click(screen.getByRole("button", { name: "Keep it on" }));

    expect(updateAnalyticsEnabled).toHaveBeenCalledWith(true);
  });

  it("applies a choice made while signed out once the user signs in", () => {
    window.localStorage.setItem("pathway.analytics-consent.v1", "declined");
    render(<AnalyticsNotice />);

    act(() => signIn(true));

    expect(updateAnalyticsEnabled).toHaveBeenCalledWith(false);
  });

  it("does not resend a choice the account already matches", () => {
    window.localStorage.setItem("pathway.analytics-consent.v1", "declined");
    render(<AnalyticsNotice />);

    act(() => signIn(false));

    expect(updateAnalyticsEnabled).not.toHaveBeenCalled();
  });

  it("adopts a decline saved on the account from another device", () => {
    render(<AnalyticsNotice />);

    act(() => signIn(false));

    expect(window.localStorage.getItem("pathway.analytics-consent.v1")).toBe("declined");
    expect(screen.queryByRole("dialog", { name: "Help us improve Pathway" })).toBeNull();
    expect(initAnalytics).not.toHaveBeenCalled();
  });

  it("still asks when the account only has the default of on", () => {
    render(<AnalyticsNotice />);

    act(() => signIn(true));

    expect(screen.getByRole("dialog", { name: "Help us improve Pathway" })).toBeTruthy();
    expect(updateAnalyticsEnabled).not.toHaveBeenCalled();
  });
});

describe("AnalyticsNotice", () => {
  it("shows on the first visit", () => {
    render(<AnalyticsNotice />);

    expect(screen.getByRole("dialog", { name: "Help us improve Pathway" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Keep it on" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Turn it off" })).toBeTruthy();
  });

  it("keeps analytics on when accepted", () => {
    render(<AnalyticsNotice />);

    fireEvent.click(screen.getByRole("button", { name: "Keep it on" }));

    expect(window.localStorage.getItem("pathway.analytics-consent.v1")).toBe("accepted");
    expect(initAnalytics).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Help us improve Pathway" })).toBeNull();
  });

  it("does not start analytics when turned off", () => {
    render(<AnalyticsNotice />);

    fireEvent.click(screen.getByRole("button", { name: "Turn it off" }));

    expect(window.localStorage.getItem("pathway.analytics-consent.v1")).toBe("declined");
    expect(initAnalytics).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Help us improve Pathway" })).toBeNull();
  });

  it("stays hidden after consent was already set", () => {
    window.localStorage.setItem("pathway.analytics-consent.v1", "declined");

    render(<AnalyticsNotice />);

    expect(screen.queryByRole("dialog", { name: "Help us improve Pathway" })).toBeNull();
  });
});
