import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test/renderWithRouter";
import type { AppNotification } from "../features/notifications/notifications.types";
import { NotificationsButton } from "./NotificationsButton";

afterEach(cleanup);

const unreadItem: AppNotification = {
  id: "n1",
  kind: "STREAK",
  title: "Keep your streak going",
  body: "One small step today.",
  createdAt: new Date().toISOString(),
  read: false,
};

describe("NotificationsButton", () => {
  it("is a usable button, closed until asked", async () => {
    await renderWithRouter(() => <NotificationsButton />);

    const bell = screen.getByRole("button", { name: "Notifications" });
    expect(bell.getAttribute("aria-disabled")).toBeNull();
    expect(bell.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("heading", { name: "Notifications" })).toBeNull();
  });

  it("opens the list when the bell is hovered, and closes it when the pointer leaves", async () => {
    await renderWithRouter(() => <NotificationsButton />);
    const bell = screen.getByRole("button", { name: "Notifications" });

    await userEvent.hover(bell);
    expect(await screen.findByRole("heading", { name: "Notifications" })).toBeTruthy();
    expect(screen.getByText("You are all caught up")).toBeTruthy();

    await userEvent.unhover(bell);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Notifications" })).toBeNull());
  });

  it("stays open while the pointer moves from the bell onto the list", async () => {
    await renderWithRouter(() => <NotificationsButton />);
    const bell = screen.getByRole("button", { name: "Notifications" });

    await userEvent.hover(bell);
    const heading = await screen.findByRole("heading", { name: "Notifications" });
    await userEvent.unhover(bell);
    await userEvent.hover(heading);

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeTruthy();
  });

  it("opens on click for people without a hover, and closes on Escape", async () => {
    await renderWithRouter(() => <NotificationsButton />);

    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByRole("heading", { name: "Notifications" })).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Notifications" })).toBeNull());
  });

  it("stays open after a click even when the pointer moves away", async () => {
    await renderWithRouter(() => <NotificationsButton />);
    const bell = screen.getByRole("button", { name: "Notifications" });

    await userEvent.click(bell);
    await userEvent.unhover(bell);

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeTruthy();
  });

  it("says how many are unread in the button's name", async () => {
    await renderWithRouter(() => <NotificationsButton notifications={[unreadItem, { ...unreadItem, id: "n2" }]} />);

    expect(screen.getByRole("button", { name: "Notifications, 2 unread" })).toBeTruthy();
  });

  it("shows the notifications it is given and passes Mark all read through", async () => {
    const onMarkAllRead = vi.fn();
    await renderWithRouter(() => (
      <NotificationsButton notifications={[unreadItem]} onMarkAllRead={onMarkAllRead} />
    ));

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Keep your streak going")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("links to the full notifications page and closes the list when followed", async () => {
    await renderWithRouter(() => <NotificationsButton />);

    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    const link = await screen.findByRole("link", { name: "See all notifications" });
    expect(link.getAttribute("href")).toBe("/notifications");

    await userEvent.click(link);
    await waitFor(() => expect(screen.queryByRole("link", { name: "See all notifications" })).toBeNull());
  });
});
