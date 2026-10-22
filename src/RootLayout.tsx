import { Outlet, useLocation, useMatches } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import AppShell from "./components/AppShell";
import ErrorFallback from "./components/ErrorFallback";
import { clearSentryUser, setSentryUser } from "./lib/monitoring/sentry";
import { useAuthStore } from "./lib/stores/authStore";

export default function RootLayout() {
  // The deepest route that sets `staticData.shellVariant` decides the sidebar.
  const shellVariant = useMatches({
    select: (matches) =>
      matches.findLast((match) => match.staticData.shellVariant)?.staticData
        .shellVariant,
  });
  const pathname = useLocation({ select: (location) => location.pathname });
  const userId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    Sentry.setTag("route", pathname);
  }, [pathname]);

  useEffect(() => {
    if (userId) {
      setSentryUser(userId);
    } else {
      clearSentryUser();
    }
  }, [userId]);

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
