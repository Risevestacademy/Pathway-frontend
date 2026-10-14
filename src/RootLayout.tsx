import { Outlet, useMatches } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as Sentry from "@sentry/react";
import AppShell from "./components/AppShell";
import ErrorFallback from "./components/ErrorFallback";

export default function RootLayout() {
  // The deepest route that sets `staticData.shellVariant` decides the sidebar.
  const shellVariant = useMatches({
    select: (matches) =>
      matches.findLast((match) => match.staticData.shellVariant)?.staticData
        .shellVariant,
  });

  return (
    <AppShell variant={shellVariant}>
      <Sentry.ErrorBoundary
        fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}
      >
        <Outlet />
      </Sentry.ErrorBoundary>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </AppShell>
  );
}
