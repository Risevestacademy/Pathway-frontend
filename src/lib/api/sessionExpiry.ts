import type { AnyRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Runs once a refresh has failed and auth is cleared. Protected pages send the
 * user to log in and back again; public pages carry on signed out.
 */
export async function handleSessionExpired(
  router: AnyRouter,
  queryClient: QueryClient,
): Promise<void> {
  const { location, matches } = router.state;
  const onProtectedPage = matches.some((match) =>
    match.routeId.startsWith("/_protected"),
  );

  if (!onProtectedPage) {
    // Keep what's on screen; drop the old session's data that isn't.
    queryClient.removeQueries({ type: "inactive" });
    return;
  }

  await router.navigate({
    to: "/login",
    search: { redirect: location.href },
    replace: true,
  });
  // Cleared after the protected pages unmount, so nothing refetches with no session.
  queryClient.clear();
}
