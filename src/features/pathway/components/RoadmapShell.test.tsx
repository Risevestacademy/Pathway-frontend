import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "../../../routeTree.gen";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

const pathway = {
  id: "p1",
  careerId: "c1",
  title: "Backend Engineering Fundamentals",
  description: "",
  steps: [
    {
      id: "s1",
      title: "Learn TypeScript Basics",
      description: "",
      learningObjective: "Write type-safe code.",
      prerequisites: null,
      expectedActivity: "Build a small typed module.",
      order: 1,
      skills: [],
      resources: [
        {
          id: "r1",
          title: "TypeScript Handbook",
          description: null,
          url: "https://www.typescriptlang.org/docs/",
          type: "ARTICLE",
          provider: "Microsoft",
          costStatus: "FREE",
          certificationCost: null,
          curationRationale: "Official docs.",
          lastCheckedDate: "2026-10-01",
          skills: [],
        },
      ],
    },
  ],
};

async function renderAt(path: string, backLabel: string) {
  server.use(http.get("*/careers/c1/pathway", () => HttpResponse.json({ pathway })));
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole("link", { name: backLabel }, { timeout: 5000 });
}

describe.each([
  ["/careers/c1/roadmap", "Career details"],
  ["/careers/c1/roadmap/s1", "Roadmap"],
  ["/careers/c1/roadmap/s1/resources", "Back to step"],
])("%s", (path, backLabel) => {
  it("renders one app nav inside the shell, whose sidebar has no nav of its own", async () => {
    await renderAt(path, backLabel);

    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(1);
    // The shell's sidebar only holds the logo, copyright and illustration.
    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).queryByRole("navigation")).toBeNull();
  });
});
