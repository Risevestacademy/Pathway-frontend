import { createRootRoute, Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import RootLayout from "../RootLayout";
import ErrorFallback from "../components/ErrorFallback";

const NotFound = () => (
  <main className="p-6 flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold">Page not found</h1>
    <p className="mt-2">The page you requested does not exist.</p>
    <Link to="/" className="mt-4 inline-block underline">
      Return home
    </Link>
  </main>
);

const RouteError = ({ error, reset }: ErrorComponentProps) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorFallback resetError={reset} />;
};

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
});
