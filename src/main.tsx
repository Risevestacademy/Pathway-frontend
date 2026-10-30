import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen.ts";
import { captureErrorResponse, initSentry } from "./lib/monitoring/sentry";
import { initAnalytics } from "./lib/monitoring/events";
import { setSessionExpiredHandler } from "./lib/api/axios";
import { handleSessionExpired } from "./lib/api/sessionExpiry";
import { retryUnlessClientError } from "./lib/queryRetry";
import "./index.css";

initSentry();

const analyticsOptions = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  capture_pageview: "history_change",
  defaults: "2026-05-30",
  debug: import.meta.env.DEV,
} as const;

const router = createRouter({ routeTree });
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryUnlessClientError,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: captureErrorResponse,
  }),
  mutationCache: new MutationCache({
    onError: captureErrorResponse,
  }),
});

setSessionExpiredHandler(() => {
  void handleSessionExpired(router, queryClient);
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

void initAnalytics(
  import.meta.env.VITE_POSTHOG_PROJECT_TOKEN,
  analyticsOptions,
);
