import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AnalyticsNotice } from "./AnalyticsNotice";

const { initAnalytics } = vi.hoisted(() => ({
  initAnalytics: vi.fn(() => Promise.resolve()),
}));

vi.mock("../lib/monitoring/events", () => ({
  initAnalytics,
}));

vi.mock("../lib/monitoring/analyticsConfig", () => ({
  analyticsOptions: {},
}));

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
  initAnalytics.mockClear();
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
