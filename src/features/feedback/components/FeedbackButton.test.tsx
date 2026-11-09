import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FeedbackButton } from "./FeedbackButton";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);

describe("FeedbackButton", () => {
  it("opens general feedback with no topic chosen", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <FeedbackButton />
      </QueryClientProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Feedback" }));

    expect(screen.getByRole("dialog", { name: "Send feedback" })).toBeTruthy();
    expect(screen.getByLabelText("What is this about?").textContent).toContain("Choose a topic");
  });
});
