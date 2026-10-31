import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";

/**
 * Renders a component at `path` with a router (for Link) and a fresh query
 * client. Resolves once the router has rendered it.
 */
export async function renderWithRouter(
  ui: () => ReactNode,
  { path = "/", queryClient = testQueryClient() }: { path?: string; queryClient?: QueryClient } = {},
) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => <div data-testid="route-root">{ui()}</div> }),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByTestId("route-root");
  return { router, queryClient };
}

export function testQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** jsdom has no <dialog> methods; the app's Modal needs them. */
export function stubDialog() {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
}
