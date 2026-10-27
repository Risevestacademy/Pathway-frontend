import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FeedbackItem } from "../adminFeedback.types";
import { ReportDetailPage } from "./ReportDetailPage";

const mutate = vi.fn();
let report: FeedbackItem;
let updateState: { isPending: boolean; isError: boolean };

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("../hooks/useAdminFeedback", () => ({
  useAdminFeedback: () => ({ data: [report], isPending: false, isError: false, refetch: vi.fn() }),
  useUpdateFeedbackStatus: () => ({ mutate, ...updateState }),
}));

const makeReport = (status: string): FeedbackItem => ({
  id: "r1",
  category: "BROKEN_LINK",
  section: "RESOURCES",
  careerId: null,
  description: "The link 404s",
  userEmail: "learner@example.com",
  platform: "WEB",
  status,
  createdAt: "2026-01-01T10:00:00Z",
  updatedAt: "2026-01-01T10:00:00Z",
});

beforeEach(() => {
  mutate.mockReset();
  updateState = { isPending: false, isError: false };
});
afterEach(cleanup);

describe("ReportDetailPage status controls", () => {
  it("offers both actions on a new report", () => {
    report = makeReport("NEW");
    render(<ReportDetailPage reportId="r1" />);

    expect(screen.getByRole("button", { name: "Start review" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mark as resolved" })).toBeTruthy();
  });

  it("hides Start review once the report is under review", () => {
    report = makeReport("UNDER_REVIEW");
    render(<ReportDetailPage reportId="r1" />);

    expect(screen.queryByRole("button", { name: "Start review" })).toBeNull();
    expect(screen.getByRole("button", { name: "Mark as resolved" })).toBeTruthy();
  });

  it("offers no way to change a resolved report", () => {
    report = makeReport("RESOLVED");
    render(<ReportDetailPage reportId="r1" />);

    expect(screen.queryByRole("button", { name: "Start review" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mark as resolved" })).toBeNull();
  });

  it("sends the new status when Start review is clicked", async () => {
    report = makeReport("NEW");
    render(<ReportDetailPage reportId="r1" />);

    await userEvent.click(screen.getByRole("button", { name: "Start review" }));

    expect(mutate).toHaveBeenCalledWith({ id: "r1", status: "UNDER_REVIEW" }, expect.anything());
  });

  it("disables the buttons and the select while a request runs", () => {
    report = makeReport("NEW");
    updateState = { isPending: true, isError: false };
    render(<ReportDetailPage reportId="r1" />);

    expect(screen.getByRole("button", { name: "Start review" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Mark as resolved" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("combobox").hasAttribute("disabled")).toBe(true);
  });

  it("shows an error when the update fails", () => {
    report = makeReport("NEW");
    updateState = { isPending: false, isError: true };
    render(<ReportDetailPage reportId="r1" />);

    expect(screen.getByRole("alert").textContent).toContain("Couldn’t update the status");
  });
});
