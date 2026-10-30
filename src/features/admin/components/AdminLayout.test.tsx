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

let fullName = "Ada Lovelace";

vi.mock("../hooks/useCurrentMember", () => ({
  useCurrentMember: () => ({ fullName }),
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

  it("is hidden on the team pages, which come from the API", () => {
    for (const path of ["/admin/team", "/admin/team/invites"]) {
      pathname = path;
      render(<AdminLayout />);

      expect(screen.queryByRole("note")).toBeNull();
      cleanup();
    }
  });

  it("shows the signed-in admin's name instead of a generic title", () => {
    pathname = "/admin";
    fullName = "Ada Lovelace";
    render(<AdminLayout />);

    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.queryByText("Content admin")).toBeNull();
  });

  it("falls back to Admin when there is no name", () => {
    pathname = "/admin";
    fullName = "";
    render(<AdminLayout />);

    expect(screen.getByText("Admin")).toBeTruthy();
  });
});
