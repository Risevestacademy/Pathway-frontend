import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AppNotification } from "../notifications.types";
import { NotificationsPanel } from "./NotificationsPanel";

afterEach(cleanup);

const NOW = new Date(2026, 10, 18, 12, 0, 0);

const item = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: "n1",
  kind: "OPENING",
  title: "New opening: UX Design Intern",
  body: "Lagos, hybrid. Closes in 5 days.",
  createdAt: new Date(NOW.getTime() - 40 * 60 * 1000).toISOString(),
  read: false,
  ...overrides,
});

describe("NotificationsPanel", () => {
  it("says everything is read when there are no notifications, and offers nothing to mark", () => {
    render(<NotificationsPanel notifications={[]} onMarkAllRead={vi.fn()} now={NOW} />);

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeTruthy();
    expect(screen.getByText("You're all caught up")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByRole("button", { name: "Mark all read" })).toBeNull();
  });

  it("lists each notification with its title, text and how long ago it came", () => {
    render(
      <NotificationsPanel
        notifications={[item(), item({ id: "n2", kind: "STREAK", title: "Keep your streak going", body: "One small step.", read: true })]}
        onMarkAllRead={vi.fn()}
        now={NOW}
      />,
    );

    const rows = within(screen.getByRole("list", { name: "Notifications" })).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("New opening: UX Design Intern")).toBeTruthy();
    expect(within(rows[0]).getByText("Lagos, hybrid. Closes in 5 days.")).toBeTruthy();
    expect(within(rows[0]).getByText("40 minutes ago")).toBeTruthy();
    expect(within(rows[1]).getByText("Keep your streak going")).toBeTruthy();
  });

  it("marks unread ones for screen readers and leaves read ones plain", () => {
    render(
      <NotificationsPanel notifications={[item(), item({ id: "n2", read: true })]} onMarkAllRead={vi.fn()} now={NOW} />,
    );

    const rows = within(screen.getByRole("list", { name: "Notifications" })).getAllByRole("listitem");
    expect(within(rows[0]).getByText("Unread")).toBeTruthy();
    expect(within(rows[1]).queryByText("Unread")).toBeNull();
  });

  it("draws each kind with its own icon", () => {
    render(
      <NotificationsPanel
        notifications={[
          item({ id: "a", kind: "OPENING" }),
          item({ id: "b", kind: "ROADMAP_UPDATED" }),
          item({ id: "c", kind: "STREAK" }),
          item({ id: "d", kind: "FEEDBACK_REPLY" }),
          item({ id: "e", kind: "LINK_WITHDRAWN" }),
        ]}
        onMarkAllRead={vi.fn()}
        now={NOW}
      />,
    );

    const rows = within(screen.getByRole("list", { name: "Notifications" })).getAllByRole("listitem");
    const src = (row: HTMLElement) => row.querySelector("img")?.getAttribute("src") ?? "";
    expect(src(rows[0])).toContain("opening");
    expect(src(rows[1])).toContain("roadmap");
    expect(src(rows[2])).toContain("streak");
    expect(src(rows[3])).toContain("feedback");
    expect(src(rows[4])).toContain("warning");
  });

  it("offers Mark all read only while something is unread, and calls back when pressed", async () => {
    const onMarkAllRead = vi.fn();
    const { rerender } = render(
      <NotificationsPanel notifications={[item()]} onMarkAllRead={onMarkAllRead} now={NOW} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);

    rerender(<NotificationsPanel notifications={[item({ read: true })]} onMarkAllRead={onMarkAllRead} now={NOW} />);
    expect(screen.queryByRole("button", { name: "Mark all read" })).toBeNull();
  });

  it("has no Mark all read button when nothing can handle it", () => {
    render(<NotificationsPanel notifications={[item()]} now={NOW} />);

    expect(screen.queryByRole("button", { name: "Mark all read" })).toBeNull();
  });
});
