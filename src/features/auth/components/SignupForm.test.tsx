import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailAlreadyRegisteredError } from "../../../lib/api/auth.api";
import SignupForm from "./SignupForm";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("./AuthLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("./AuthGoogleButton", () => ({ default: () => null }));

afterEach(cleanup);

async function submitWith(error: Error) {
  render(
    <SignupForm
      onSubmit={() => Promise.reject(error)}
      onGoogleAuth={vi.fn()}
    />,
  );
  await userEvent.type(screen.getByPlaceholderText("Full name"), "Ada Lovelace");
  await userEvent.type(screen.getByPlaceholderText("Email address"), "ada@example.com");
  await userEvent.type(screen.getByPlaceholderText("Password"), "password123");
  await userEvent.click(screen.getByRole("button", { name: "Create account" }));
}

describe("SignupForm", () => {
  it("offers to log in when the email is already registered", async () => {
    await submitWith(new EmailAlreadyRegisteredError());

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Log in instead" })).toBeTruthy();
  });

  it("goes by the error type, not by its text", async () => {
    await submitWith(new Error("This email is already registered."));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Log in instead" })).toBeNull();
  });
});
