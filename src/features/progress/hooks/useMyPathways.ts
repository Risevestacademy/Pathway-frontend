import { useQuery } from "@tanstack/react-query";
import { fetchSavedPathways } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useAuthStore } from "../../../lib/stores/authStore";

/**
 * The signed-in person's saved pathways with their progress. It shares its
 * cache with the roadmap pages (`queryKeys.progress.saved`), so marking a step
 * done anywhere keeps the numbers here in step. A 401, 403 or 404 won't clear
 * on a retry, so only other failures are tried again.
 */
export function useMyPathways(enabled = true) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  return useQuery({
    queryKey: queryKeys.progress.saved(userId),
    queryFn: fetchSavedPathways,
    enabled: enabled && userId !== "",
    staleTime: 30 * 1000,
    retry: retryUnlessClientError,
  });
}
