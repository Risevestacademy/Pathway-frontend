import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { FeedbackButton } from "./FeedbackButton";

const server = setupServer(
  http.post("*/feedback", () => HttpResponse.json({ message: "Feedback received" }, { status: 201 })),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);
afterAll(() => server.close());

describe("FeedbackButton", () => {
  it("announces the thanks through a live region that is there from the start", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <FeedbackButton />
      </QueryClientProvider>,
    );
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");

    await userEvent.click(screen.getByRole("button", { name: "Feedback" }));
    await userEvent.click(screen.getByRole("radio", { name: "Something is confusing" }));
    await userEvent.click(screen.getByRole("button", { name: "Send report" }));

    await waitFor(() => expect(status.textContent).toBe("Thanks, your feedback was sent."));
    expect(screen.getByRole("status")).toBe(status);
  });
});
