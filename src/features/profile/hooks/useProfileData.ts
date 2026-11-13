import { useQuery } from "@tanstack/react-query";
import { fetchActivePathway } from "../../../lib/api/progress.api";
import { fetchProfile } from "../../../lib/api/users.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useAuthStore } from "../../../lib/stores/authStore";

const STALE_MS = 30 * 1000;

export function useProfile() {
  const userId = useAuthStore((state) => state.user?.id ?? "");

  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: fetchProfile,
    enabled: userId !== "",
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });
}

export function useActivePathway() {
  const userId = useAuthStore((state) => state.user?.id ?? "");

  return useQuery({
    queryKey: queryKeys.progress.active(userId),
    queryFn: fetchActivePathway,
    enabled: userId !== "",
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });
}