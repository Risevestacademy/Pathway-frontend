import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../../lib/stores/authStore";
import { ReportIssueDialog, type ReportTarget } from "./ReportIssueDialog";

const CAREER_ID = "6f1c2a7e-0d4b-4b8e-9f53-2a1e7c9d0b11";
const ABOUT = "Frontend Developer · Step 3, SQL basics";
const server = setupServer();
let sent: unknown[];

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  // Radix Select needs these, and jsdom doesn't have them.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});
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

function setup(target: ReportTarget = { section: "PATHWAY", careerId: CAREER_ID }, about: string | null = ABOUT) {
  const onClose = vi.fn();

  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <ReportIssueDialog
        {...target}
        about={about ?? undefined}
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    );
  }

  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <Harness />
    </QueryClientProvider>,
  );
  return { onClose };
}

const message = () => screen.getByLabelText("Your feedback");
const email = () => screen.getByLabelText("Email for a reply (optional)");
const send = () => screen.getByRole("button", { name: "Send feedback" });

describe("ReportIssueDialog", () => {
  it("needs a careerId for every section except GENERAL", () => {
    // @ts-expect-error The API rejects a PATHWAY report without a careerId.
    const missing: ReportTarget = { section: "PATHWAY" };
    const general: ReportTarget = { section: "GENERAL" };

    expect([missing.section, general.section]).toEqual(["PATHWAY", "GENERAL"]);
  });

  it("starts on the topic for where it was opened and says what it's about", () => {
    setup({ section: "RESOURCES", careerId: CAREER_ID });

    expect(screen.getByLabelText("What is this about?").textContent).toContain("A link or resource");
    expect(screen.getByText(ABOUT)).toBeTruthy();
  });

  it("asks for a message before sending", async () => {
    setup();

    await userEvent.click(send());

    expect(screen.getByText("Tell us what happened so we can look into it.")).toBeTruthy();
    expect(message().getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(message());
    expect(sent).toEqual([]);

    await userEvent.type(message(), "x");
    expect(screen.queryByText("Tell us what happened so we can look into it.")).toBeNull();
  });

  it("sends the section, career, category and what it's about, then thanks the learner", async () => {
    const { onClose } = setup();

    await userEvent.type(message(), "This step is missing practice tasks");
    await userEvent.click(send());

    expect(await screen.findByRole("dialog", { name: "Thanks, we got your feedback" })).toBeTruthy();
    expect(sent).toEqual([
      {
        category: "INCORRECT_CONTENT",
        description: `This step is missing practice tasks (${ABOUT})`,
        section: "PATHWAY",
        careerId: CAREER_ID,
        platform: "WEB",
      },
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("sends general feedback with the topic chosen and the page it came from", async () => {
    setup({ section: "GENERAL" }, null);

    expect(screen.getByText(/We note the page you came from/)).toBeTruthy();
    await userEvent.click(screen.getByLabelText("What is this about?"));
    await userEvent.click(await screen.findByRole("option", { name: "Something is not working" }));
    await userEvent.type(message(), "The page froze");
    await userEvent.click(send());

    await screen.findByRole("dialog", { name: "Thanks, we got your feedback" });
    expect(sent).toEqual([
      {
        category: "USABILITY",
        description: `The page froze (Page: ${window.location.pathname})`,
        section: "GENERAL",
        platform: "WEB",
      },
    ]);
  });

  it("files general feedback with no topic as OTHER", async () => {
    setup({ section: "GENERAL" }, null);

    await userEvent.type(message(), "Love it");
    await userEvent.click(send());

    await screen.findByRole("dialog", { name: "Thanks, we got your feedback" });
    expect(sent[0]).toMatchObject({ category: "OTHER" });
  });

  it("checks an optional email, and sends it when given", async () => {
    setup();

    await userEvent.type(message(), "Broken");
    await userEvent.type(email(), "not-an-email");
    await userEvent.click(send());

    expect(screen.getByText("Invalid email address")).toBeTruthy();
    expect(sent).toEqual([]);

    await userEvent.clear(email());
    await userEvent.type(email(), " Ada@Example.com ");
    await userEvent.click(send());

    await screen.findByRole("dialog", { name: "Thanks, we got your feedback" });
    expect(sent[0]).toMatchObject({ userEmail: "Ada@Example.com" });
  });

  it("fills in the account email when signed in, and leaves it out if cleared", async () => {
    useAuthStore.setState({ user: { id: "u1", email: "ada@example.com", role: "LEARNER" }, accessToken: "t" });
    setup();

    expect((email() as HTMLInputElement).value).toBe("ada@example.com");
    await userEvent.clear(email());
    await userEvent.type(message(), "Broken");
    await userEvent.click(send());

    await screen.findByRole("dialog", { name: "Thanks, we got your feedback" });
    expect(sent[0]).not.toHaveProperty("userEmail");
  });

  it("keeps the message and offers to try again when sending fails", async () => {
    server.use(http.post("*/feedback", () => new HttpResponse(null, { status: 429 })));
    const { onClose } = setup();

    await userEvent.type(message(), "Broken");
    await userEvent.click(send());

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/We could not send your feedback/);
    expect(alert.textContent).toMatch(/sent a few reports/);
    expect((message() as HTMLTextAreaElement).value).toBe("Broken");
    expect(onClose).not.toHaveBeenCalled();

    server.use(http.post("*/feedback", () => HttpResponse.json({}, { status: 201 })));
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("dialog", { name: "Thanks, we got your feedback" })).toBeTruthy();
  });

  it("closes straight away when nothing has been written", async () => {
    const { onClose } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("asks before throwing away a written message", async () => {
    const { onClose } = setup();

    await userEvent.type(message(), "Half a thought");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("dialog", { name: "Discard this message?" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Keep writing" }));
    expect((message() as HTMLTextAreaElement).value).toBe("Half a thought");
    expect(document.activeElement).toBe(message());
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("treats Escape like Cancel", async () => {
    const { onClose } = setup();

    await userEvent.type(message(), "Half a thought");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByRole("dialog", { name: "Discard this message?" })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("starts a fresh message from the thanks screen", async () => {
    setup();

    await userEvent.type(message(), "First");
    await userEvent.click(send());
    await userEvent.click(await screen.findByRole("button", { name: "Send more feedback" }));

    expect((message() as HTMLTextAreaElement).value).toBe("");
    expect(screen.getByText(ABOUT)).toBeTruthy();
  });
});
