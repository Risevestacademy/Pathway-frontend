import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../../lib/stores/authStore";
import { REPORT_REASONS } from "../feedback.utils";
import { ReportIssueDialog } from "./ReportIssueDialog";

const CAREER_ID = "6f1c2a7e-0d4b-4b8e-9f53-2a1e7c9d0b11";
const server = setupServer();
let sent: unknown[];

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  sent = [];
  server.use(
    http.post("*/feedback", async ({ request }) => {
      sent.push(await request.json());
      return HttpResponse.json({ message: "Feedback received" }, { status: 201 });
    }),
  );
  useAuthStore.setState({ user: null, accessToken: null });
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function setup(props: Partial<Parameters<typeof ReportIssueDialog>[0]> = {}) {
  const onClose = vi.fn();
  const onSent = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <ReportIssueDialog
        open
        onClose={onClose}
        onSent={onSent}
        section="PATHWAY"
        reasons={REPORT_REASONS.PATHWAY}
        careerId={CAREER_ID}
        subject="Learn React"
        contextNote="Step 2: Learn React"
        {...props}
      />
    </QueryClientProvider>,
  );
  const send = screen.getByRole<HTMLButtonElement>("button", { name: "Send report" });
  return { onClose, onSent, send };
}

describe("ReportIssueDialog", () => {
  it("keeps Send disabled until a reason is chosen", async () => {
    const { send } = setup();
    expect(send.disabled).toBe(true);

    await userEvent.click(screen.getByRole("radio", { name: "Step content is wrong or outdated" }));
    expect(send.disabled).toBe(false);
  });

  it("sends the section, career, category and context, then thanks and closes", async () => {
    const { onClose, onSent, send } = setup();

    await userEvent.click(screen.getByRole("radio", { name: "Step content is wrong or outdated" }));
    await userEvent.type(screen.getByLabelText("Details"), "Uses class components");
    await userEvent.click(send);

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(sent).toEqual([
      {
        category: "INCORRECT_CONTENT",
        description: "Uses class components (Step 2: Learn React)",
        section: "PATHWAY",
        careerId: CAREER_ID,
        platform: "WEB",
      },
    ]);
  });

  it("sends general feedback without a career", async () => {
    const { onSent, send } = setup({
      section: "GENERAL",
      reasons: REPORT_REASONS.GENERAL,
      careerId: undefined,
      contextNote: undefined,
    });

    await userEvent.click(screen.getByRole("radio", { name: "Something is confusing" }));
    await userEvent.click(send);

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(sent).toEqual([
      { category: "USABILITY", description: "Something is confusing", section: "GENERAL", platform: "WEB" },
    ]);
  });

  it("lets a signed-out learner leave an optional email, and checks it", async () => {
    const { onSent, send } = setup();

    await userEvent.click(screen.getByRole("radio", { name: "Something else" }));
    await userEvent.type(screen.getByLabelText("Email (optional)"), "not-an-email");
    await userEvent.click(send);

    expect(screen.getByText("Invalid email address")).toBeTruthy();
    expect(sent).toEqual([]);

    await userEvent.clear(screen.getByLabelText("Email (optional)"));
    await userEvent.type(screen.getByLabelText("Email (optional)"), " Ada@Example.com ");
    await userEvent.click(send);

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(sent[0]).toMatchObject({ userEmail: "Ada@Example.com" });
  });

  it("uses the account email and hides the field when signed in", async () => {
    useAuthStore.setState({ user: { id: "u1", email: "ada@example.com", role: "LEARNER" }, accessToken: "t" });
    const { onSent, send } = setup();

    expect(screen.queryByLabelText("Email (optional)")).toBeNull();
    await userEvent.click(screen.getByRole("radio", { name: "Something else" }));
    await userEvent.click(send);

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(sent[0]).toMatchObject({ userEmail: "ada@example.com" });
  });

  it("explains the rate limit and stays open", async () => {
    server.use(http.post("*/feedback", () => new HttpResponse(null, { status: 429 })));
    const { onClose, onSent, send } = setup();

    await userEvent.click(screen.getByRole("radio", { name: "Something else" }));
    await userEvent.click(send);

    expect((await screen.findByRole("alert")).textContent).toMatch(/sent a few reports/);
    expect(onSent).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
