import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";
import { PostHogProvider } from "@posthog/react";
import { initSentry } from "./lib/monitoring/sentry";
import "./index.css";

initSentry();

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  capture_pageview: "history_change",
  defaults: "2026-05-30",
  debug: import.meta.env.DEV,
} as const;

const router = createRouter({ routeTree });

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
    <PostHogProvider
      apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN}
      options={options}
    >
      <RouterProvider router={router} />
    </PostHogProvider>
  </StrictMode>,
);
