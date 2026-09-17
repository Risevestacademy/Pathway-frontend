import { createRootRoute, Link } from "@tanstack/react-router";
import RootLayout from "../RootLayout";

const NotFound = () => (
  <main className="p-6 flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold">Page not found</h1>
    <p className="mt-2">The page you requested does not exist.</p>
    <Link to="/" className="mt-4 inline-block underline">
      Return home
    </Link>
  </main>
);

const RouteError = () => (
  <main className="p-6 flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold">Something went wrong</h1>
    <p className="mt-2">Please try again or return home.</p>
    <Link to="/" className="mt-4 inline-block underline">
      Return home
    </Link>
  </main>
);

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
});
