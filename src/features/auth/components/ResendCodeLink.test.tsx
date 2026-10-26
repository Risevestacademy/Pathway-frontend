import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResendCodeLink from "./ResendCodeLink";

afterEach(cleanup);

describe("ResendCodeLink", () => {
  it("resends to the trimmed email from the form", async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);
    render(<ResendCodeLink getEmail={() => "  a@b.co "} onResend={onResend} />);

    await userEvent.click(screen.getByRole("button", { name: "Resend code" }));

    expect(onResend).toHaveBeenCalledWith("a@b.co");
  });

  it("asks for an email instead of sending when the field is empty", async () => {
    const onResend = vi.fn();
    render(<ResendCodeLink getEmail={() => ""} onResend={onResend} />);

    await userEvent.click(screen.getByRole("button", { name: "Resend code" }));

    expect(onResend).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Enter your email");
  });

  it("shows the error and lets the user retry when sending fails", async () => {
    const onResend = vi.fn().mockRejectedValue(new Error("Too many attempts."));
    render(<ResendCodeLink getEmail={() => "a@b.co"} onResend={onResend} />);

    await userEvent.click(screen.getByRole("button", { name: "Resend code" }));

    expect(screen.getByRole("alert").textContent).toContain("Too many attempts.");
    expect(screen.getByRole("button", { name: "Resend code" }).hasAttribute("disabled")).toBe(false);
  });
});
