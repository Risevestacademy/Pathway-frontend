import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AdminLayout } from "./AdminLayout";

let pathname = "/admin/careers";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
  Outlet: () => null,
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) =>
    select({ location: { pathname } }),
}));

vi.mock("../hooks/useAdminFeedback", () => ({
  useAdminFeedback: () => ({ data: [] }),
}));

afterEach(cleanup);

describe("AdminLayout local preview notice", () => {
  it("warns that edits are saved in this browser only", () => {
    pathname = "/admin/careers";
    render(<AdminLayout />);

    expect(screen.getByRole("note").textContent).toContain("Local preview only");
  });

  it("is hidden on reports, which come from the API", () => {
    pathname = "/admin/reports/abc";
    render(<AdminLayout />);

    expect(screen.queryByRole("note")).toBeNull();
  });
});
