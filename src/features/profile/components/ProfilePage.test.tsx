import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { apiHandlers, renderAt, signIn, signOut } from "@/test/renderApp";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSession } from "@/lib/stores/session";
import { profileActivePathway as active, profileMe as me } from "@/test/fixtures/profile.fixture";

vi.setConfig({ testTimeout: 90_000 });

const server = setupServer();

let patched: unknown[];

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
beforeEach(() => {
  patched = [];
  server.use(
    http.get("*/auth/me", () => HttpResponse.json(me)),
    http.get("*/me/active-pathway", () => HttpResponse.json(active)),
    http.patch("*/users/me", async ({ request }) => {
      const body = (await request.json()) as { firstName: string; lastName: string | null };
      patched.push(body);
      return HttpResponse.json({ ...me, ...body, fullName: [body.firstName, body.lastName].filter(Boolean).join(" ") });
    }),
    ...apiHandlers(),
  );
  signIn();
  useAuthStore.setState({ user: { id: "u1", email: me.email, role: "USER", fullName: me.fullName } });
  useSession.setState({ level: null });
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  signOut();
});
afterAll(() => server.close());

const editName = async () => {
  await userEvent.click(await screen.findByRole("button", { name: "Edit name" }));
  return {
    first: screen.getByLabelText("First name") as HTMLInputElement,
    last: screen.getByLabelText(/^Last name/) as HTMLInputElement,
  };
};

describe("Profile page", () => {
  it("shows the name, email and active pathway progress", async () => {
    await renderAt("/profile");

    expect((await screen.findByRole("heading", { name: "Ada Obi" })).textContent).toBe("Ada Obi");
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect((await screen.findByRole("heading", { name: "Product Designer" })).textContent).toBe("Product Designer");
    expect(screen.getByText("5 of 16 steps complete")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("5");
    expect(screen.getByRole("link", { name: "Go to My Pathway" }).getAttribute("href")).toBe("/my-pathway/c1/overview");
  });

  it("marks the sections that cannot be saved yet", async () => {
    await renderAt("/profile");

    for (const title of ["Education", "Experience", "Skills", "Career interests"]) {
      expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
    }
    expect(screen.getAllByText("Coming soon")).toHaveLength(4);
  });

  it("saves a new name and says so", async () => {
    await renderAt("/profile");
    const { first, last } = await editName();

    expect(document.activeElement).toBe(first);
    await userEvent.clear(first);
    await userEvent.type(first, "Adaeze");
    await userEvent.clear(last);
    await userEvent.type(last, " Okafor ");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("heading", { name: "Adaeze Okafor" })).textContent).toBe("Adaeze Okafor");
    expect(patched).toEqual([{ firstName: "Adaeze", lastName: "Okafor" }]);
    expect(screen.getByText("Name updated.")).toBeTruthy();
    expect(useAuthStore.getState().user?.fullName).toBe("Adaeze Okafor");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit name" })));
  });

  it("shows the email as read-only with a note that changing it is coming", async () => {
    await renderAt("/profile");
    await editName();

    expect(screen.getByText("Email: ada@example.com")).toBeTruthy();
    expect(screen.getByText("Changing your email is coming soon.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();
  });

    it("asks for a first name before sending anything", async () => {
    await renderAt("/profile");
    const { first } = await editName();

    await userEvent.clear(first);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Enter your first name.")).toBeTruthy();
    expect(first.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(first);
    expect(patched).toEqual([]);

    await userEvent.type(first, "A");
    expect(screen.queryByText("Enter your first name.")).toBeNull();
  });

  it("lets the last name be left empty and sends null", async () => {
    await renderAt("/profile");
    const { last } = await editName();

    await userEvent.clear(last);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("heading", { name: "Ada" })).textContent).toBe("Ada");
    expect(patched).toEqual([{ firstName: "Ada", lastName: null }]);
  });

  it("rejects a name longer than 100 characters", async () => {
    await renderAt("/profile");
    const { last } = await editName();

    await userEvent.clear(last);
    await userEvent.click(last);
    await userEvent.paste("a".repeat(101));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Last name must be 100 characters or fewer.")).toBeTruthy();
    expect(patched).toEqual([]);
  });

  it("does not send a request when the name has not changed", async () => {
    await renderAt("/profile");
    await editName();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("button", { name: "Edit name" })).toBeTruthy();
    expect(patched).toEqual([]);
  });

  it("keeps the form open and explains when saving fails", async () => {
    server.use(http.patch("*/users/me", () => new HttpResponse(null, { status: 500 })));
    await renderAt("/profile");
    const { first } = await editName();

    await userEvent.type(first, "x");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/could not save your name/i);
    expect((screen.getByLabelText("First name") as HTMLInputElement).value).toBe("Adax");
  });

  it("shows the server's rejection of a name", async () => {
    server.use(http.patch("*/users/me", () => HttpResponse.json({ message: ["bad"] }, { status: 400 })));
    await renderAt("/profile");
    const { first } = await editName();

    await userEvent.type(first, "x");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/Check it and try again/i);
  });

  it("cancels with the button or Escape and keeps the old name", async () => {
    await renderAt("/profile");
    const { first } = await editName();

    await userEvent.type(first, "zzz");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect((await screen.findByRole("heading", { name: "Ada Obi" })).textContent).toBe("Ada Obi");

    const again = await editName();
    expect(again.first.value).toBe("Ada");
    await userEvent.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: "Edit name" })).toBeTruthy();
    expect(patched).toEqual([]);
  });

  it("locks the other cards while the name is being edited", async () => {
    await renderAt("/profile");
    await editName();

    expect(screen.getByRole("radiogroup", { name: "Level" }).closest("[inert]")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.getByRole("radiogroup", { name: "Level" }).closest("[inert]")).toBeNull());
  });

  it("lets the learner pick one level", async () => {
    await renderAt("/profile");

    const graduate = await screen.findByRole("radio", { name: "Recent graduate" });
    await userEvent.click(graduate);

    expect((graduate as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("radio", { name: "University student" }) as HTMLInputElement).checked).toBe(false);
    expect(useSession.getState().level).toBe("recent-graduate");
  });

  it("invites a learner with no pathway to explore careers", async () => {
    server.use(
      http.get("*/me/active-pathway", () =>
        HttpResponse.json({ career: null, pathway: null, progress: null, steps: [] }),
      ),
    );
    await renderAt("/profile");

    expect(await screen.findByText("You have not started a pathway yet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore careers" }).getAttribute("href")).toBe("/careers");
  });

  it("offers a retry when the pathway fails to load", async () => {
    let calls = 0;
    server.use(
      http.get("*/me/active-pathway", () => {
        calls += 1;
        return calls === 1 ? new HttpResponse(null, { status: 404 }) : HttpResponse.json(active);
      }),
    );
    await renderAt("/profile");

    expect((await screen.findByRole("alert")).textContent).toMatch(/could not load your pathway/i);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("5 of 16 steps complete")).toBeTruthy();
  });

  it("offers a retry when the profile fails to load", async () => {
    let calls = 0;
    server.use(
      http.get("*/auth/me", () => {
        calls += 1;
        return calls === 1 ? new HttpResponse(null, { status: 404 }) : HttpResponse.json(me);
      }),
    );
    await renderAt("/profile");

    expect((await screen.findByRole("alert")).textContent).toMatch(/could not load your profile/i);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect((await screen.findByRole("heading", { name: "Ada Obi" })).textContent).toBe("Ada Obi");
  });
});