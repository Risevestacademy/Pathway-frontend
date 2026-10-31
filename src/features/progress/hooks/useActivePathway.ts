import { useQuery } from "@tanstack/react-query";
import { fetchActivePathway } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useAuthStore } from "../../../lib/stores/authStore";

/**
 * The pathway the signed-in person follows, with its steps and where they are
 * in it. It shares its cache with the roadmap pages (`queryKeys.progress.active`),
 * so a step marked there shows up here. A 401, 403 or 404 won't clear on a
 * retry, so only other failures are tried again.
 */
export function useActivePathway(enabled = true) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  return useQuery({
    queryKey: queryKeys.progress.active(userId),
    queryFn: fetchActivePathway,
    enabled: enabled && userId !== "",
    staleTime: 30 * 1000,
    retry: retryUnlessClientError,
  });
}
