import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as Sentry from "@sentry/react";
import AppShell from "./components/AppShell";
import ErrorFallback from "./components/ErrorFallback";

export default function RootLayout() {
  return (
    <AppShell>
      <Sentry.ErrorBoundary
        fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}
      >
        <Outlet />
      </Sentry.ErrorBoundary>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </AppShell>
  );
}
