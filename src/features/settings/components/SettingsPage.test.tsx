import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { renderAt, signIn, signOut } from "@/test/renderApp";
import { userEvent } from "@testing-library/user-event";

beforeEach(() => {
  signIn();
});

afterEach(() => {
  cleanup();
  signOut();
});

describe("Settings Page", () => {
  it("renders settings page", async () => {
    await renderAt("/settings");

    const heading = screen.getByRole("heading", { level: 1, name: "Settings" });
    const description = screen.getByText("Manage your account and your data.");
    expect(heading).toBeTruthy();
    expect(description).toBeTruthy();
  });

  it("Tabs and panel present", async () => {
    await renderAt("/settings");

    const tabs = screen.getAllByRole("tab");
    const tabPanel = screen.getAllByRole("tabpanel");
    expect(tabs).toHaveLength(3);
    expect(tabPanel).toHaveLength(1);
  });

  it("Account tab active by default", async () => {
    await renderAt("/settings");

    const accountTab = screen.getByRole("tab", {
      name: "Account",
      selected: true,
    });
    const notifications = screen.getByRole("tab", {
      name: "Notifications",
      selected: false,
    });
    const privacy = screen.getByRole("tab", {
      name: "Privacy and data",
      selected: false,
    });
    expect(accountTab).toBeTruthy();
    expect(notifications).toBeTruthy();
    expect(privacy).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: /account/i })).toBeTruthy();
    expect(
      screen.queryByRole("tabpanel", { name: "Notifications" }),
    ).toBeNull();
    expect(
      screen.queryByRole("tabpanel", { name: "Privacy and data" }),
    ).toBeNull();
  });

  it("Change panel", async () => {
    const user = userEvent.setup();
    await renderAt("/settings");

    const notifications = screen.getByRole("tab", {
      name: "Notifications",
      selected: false,
    });
    await user.click(notifications);
    expect(
      screen.getByRole("tab", {
        name: "Notifications",
        selected: true,
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("tabpanel", { name: "Account" })).toBeNull();
    expect(
      screen.getByRole("tabpanel", { name: "Notifications" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("tabpanel", { name: "Privacy and data" }),
    ).toBeNull();
  });
});
