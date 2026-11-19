import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AppNotification } from "../notifications.types";
import { NotificationsPage } from "./NotificationsPage";

afterEach(cleanup);

const NOW = new Date(2026, 10, 18, 12, 0, 0);

const item = (id: string, overrides: Partial<AppNotification> = {}): AppNotification => ({
  id,
  kind: "OPENING",
  title: `Title ${id}`,
  body: `Body ${id}`,
  createdAt: new Date(2026, 10, 18, 11, 20).toISOString(),
  read: false,
  ...overrides,
});

const earlier = new Date(2026, 9, 28, 9, 0).toISOString();

describe("NotificationsPage", () => {
  it("shows the heading and an all-caught-up state when there are no notifications", () => {
    render(<NotificationsPage notifications={[]} onMarkAllRead={vi.fn()} now={NOW} />);

    expect(screen.getByRole("heading", { level: 1, name: "Notifications" })).toBeTruthy();
    expect(screen.getByText("Updates about your pathway, openings and feedback.")).toBeTruthy();
    expect(screen.getByText("You are all caught up")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Mark all read" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Today" })).toBeNull();
  });

  it("groups notifications under Today and Earlier on the All tab", () => {
    render(
      <NotificationsPage
        notifications={[item("a"), item("b", { createdAt: earlier, read: true })]}
        onMarkAllRead={vi.fn()}
        now={NOW}
      />,
    );

    const today = screen.getByRole("region", { name: "Today" });
    const older = screen.getByRole("region", { name: "Earlier" });
    expect(within(today).getByText("Title a")).toBeTruthy();
    expect(within(today).queryByText("Title b")).toBeNull();
    expect(within(older).getByText("Title b")).toBeTruthy();
  });

  it("counts the unread ones on the Unread tab", () => {
    render(
      <NotificationsPage
        notifications={[item("a"), item("b"), item("c", { read: true })]}
        onMarkAllRead={vi.fn()}
        now={NOW}
      />,
    );

    expect(screen.getByRole("tab", { name: "All" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Unread 2" })).toBeTruthy();
  });

  it("shows only unread ones, ungrouped, on the Unread tab", async () => {
    render(
      <NotificationsPage
        notifications={[item("a"), item("b", { createdAt: earlier, read: true })]}
        onMarkAllRead={vi.fn()}
        now={NOW}
      />,
    );

    await userEvent.click(screen.getByRole("tab", { name: /^Unread/ }));

    expect(screen.getByText("Title a")).toBeTruthy();
    expect(screen.queryByText("Title b")).toBeNull();
    expect(screen.queryByRole("region", { name: "Today" })).toBeNull();
  });

  it("says all caught up on the Unread tab once everything is read", async () => {
    render(
      <NotificationsPage notifications={[item("a", { read: true })]} onMarkAllRead={vi.fn()} now={NOW} />,
    );

    await userEvent.click(screen.getByRole("tab", { name: "Unread" }));

    expect(screen.getByText("You are all caught up")).toBeTruthy();
    expect(screen.queryByText("Title a")).toBeNull();
  });

  it("offers Mark all read only while something is unread, and calls back when pressed", async () => {
    const onMarkAllRead = vi.fn();
    const { rerender } = render(
      <NotificationsPage notifications={[item("a")]} onMarkAllRead={onMarkAllRead} now={NOW} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);

    rerender(<NotificationsPage notifications={[item("a", { read: true })]} onMarkAllRead={onMarkAllRead} now={NOW} />);
    expect(screen.queryByRole("button", { name: "Mark all read" })).toBeNull();
  });

  it("keeps Notification settings visible but unavailable until there is a settings page", () => {
    render(<NotificationsPage notifications={[]} now={NOW} />);

    const settings = screen.getAllByRole("button", { name: "Notification settings" });
    expect(settings.length).toBeGreaterThan(0);
    expect(settings.every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });
});
