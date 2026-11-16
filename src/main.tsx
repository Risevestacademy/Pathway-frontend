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
import { analyticsOptions } from "./lib/monitoring/analyticsConfig";
import { getAnalyticsConsent } from "./lib/monitoring/analyticsConsent";
import { setSessionExpiredHandler } from "./lib/api/axios";
import { ensureAuthHydrated } from "./lib/api/auth.api";
import { handleSessionExpired } from "./lib/api/sessionExpiry";
import { retryUnlessClientError } from "./lib/queryRetry";
import "./index.css";

initSentry();

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

// Restore the session from the refresh cookie on every page load. Public pages
// render straight away and update when it lands; protected routes await it.
void ensureAuthHydrated();

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

if (getAnalyticsConsent() === "accepted") {
  void initAnalytics(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, analyticsOptions);
}
