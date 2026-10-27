import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FeedbackItem } from "../adminFeedback.types";
import { ReportsPage } from "./ReportsPage";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));

let reports: FeedbackItem[] = [];

vi.mock("../hooks/useAdminFeedback", () => ({
  useAdminFeedback: () => ({ data: reports, isPending: false, isError: false, refetch: vi.fn() }),
}));

const make = (n: number, status = "NEW"): FeedbackItem => ({
  id: `r${n}`,
  category: "BROKEN_LINK",
  section: "RESOURCES",
  careerId: null,
  description: `Report ${n}`,
  userEmail: "learner@example.com",
  platform: "WEB",
  status,
  createdAt: new Date(2026, 0, n).toISOString(),
  updatedAt: new Date(2026, 0, n).toISOString(),
});

afterEach(cleanup);

describe("ReportsPage paging", () => {
  it("shows 6 reports per page and moves to the next", async () => {
    reports = Array.from({ length: 8 }, (_, i) => make(i + 1));
    render(<ReportsPage />);

    expect(screen.getAllByText(/^Report \d$/)).toHaveLength(6);
    expect(screen.getByText("Showing 6 of 8 reports")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getAllByText(/^Report \d$/)).toHaveLength(2);
    expect(screen.getByText("Showing 2 of 8 reports")).toBeTruthy();
  });

  it("counts every report in the filters, not just the visible page", () => {
    reports = [...Array.from({ length: 7 }, (_, i) => make(i + 1)), make(8, "RESOLVED")];
    render(<ReportsPage />);

    expect(screen.getByRole("button", { name: "All 8" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "New 7" })).toBeTruthy();
    expect(screen.getByText("7 open reports.")).toBeTruthy();
  });

  it("goes back to page 1 when the filter changes", async () => {
    reports = Array.from({ length: 8 }, (_, i) => make(i + 1));
    render(<ReportsPage />);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    await userEvent.click(screen.getByRole("button", { name: "New 8" }));

    expect(screen.getByText("Showing 6 of 8 reports")).toBeTruthy();
  });
});
