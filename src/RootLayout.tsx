import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./components/ErrorFallback";
import Navbar from "./components/Navbar";

export default function RootLayout() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}
    >
      <Navbar />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </Sentry.ErrorBoundary>
  );
}