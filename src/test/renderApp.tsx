import { http, HttpResponse } from "msw";
import { configure, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { useAuthStore } from "@/lib/stores/authStore";
import { details, list, pathways } from "./fixtures/careersApi.fixture";
import { testQueryClient } from "./renderWithRouter";

configure({ asyncUtilTimeout: 60_000 });

export function apiHandlers() {
  return [
    http.get("*/careers", () => HttpResponse.json({ items: list })),
    http.get("*/careers/:id", ({ params }) => {
      const detail = details[params.id as keyof typeof details];
      return detail
        ? HttpResponse.json(detail)
        : new HttpResponse(null, { status: 404 });
    }),
    http.get("*/careers/:id/pathway", ({ params }) => {
      const pathway = pathways[params.id as string];
      return pathway
        ? HttpResponse.json(pathway)
        : new HttpResponse(null, { status: 404 });
    }),
    http.get("*/me/active-pathway", () =>
      HttpResponse.json({
        career: null,
        pathway: null,
        progress: null,
        steps: [],
      }),
    ),
    http.get("*/fields", () =>
      HttpResponse.json([{ id: "f1", name: "Software", slug: "software" }]),
    ),
    http.get("*/me/pathways", () => HttpResponse.json([])),
    http.post("*/auth/refresh", () => new HttpResponse(null, { status: 401 })),
  ];
}

export function signIn() {
  useAuthStore
    .getState()
    .setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
  useAuthStore.getState().finishHydrating();
}

export function signOut() {
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: false });
}

export async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <QueryClientProvider client={testQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole("main");
  return router;
}
