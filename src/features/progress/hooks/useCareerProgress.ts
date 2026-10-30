import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ensureAuthHydrated } from "../../../lib/api/auth.api";
import {
  fetchActivePathway,
  fetchSavedPathways,
} from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import type { CareerProgress } from "../progress.types";
import { getCareerProgress } from "../progress.utils";

// Short, so a change made on the other client shows up on the next visit.
const STALE_MS = 30 * 1000;

/**
 * The roadmap pages are public, so restore any existing session here before
 * deciding whether to show progress or a sign-in prompt.
 */
export function useProgressUserId(): { userId: string | null; isHydrating: boolean } {
  const userId = useAuthStore((state) =>
    selectIsAuthenticated(state) ? (state.user?.id ?? null) : null,
  );
  const isHydrating = useAuthStore((state) => state.isHydrating);

  useEffect(() => {
    void ensureAuthHydrated();
  }, []);

  return { userId, isHydrating: isHydrating && userId === null };
}

export function useCareerProgress(careerId: string): {
  progress: CareerProgress;
  retry: () => void;
} {
  const { userId, isHydrating } = useProgressUserId();

  const activeQuery = useQuery({
    queryKey: queryKeys.progress.active(userId ?? ""),
    queryFn: fetchActivePathway,
    enabled: userId !== null,
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });

  const savedQuery = useQuery({
    queryKey: queryKeys.progress.saved(userId ?? ""),
    queryFn: fetchSavedPathways,
    enabled: userId !== null,
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });

  const retry = () => {
    void activeQuery.refetch();
    void savedQuery.refetch();
  };

  if (userId === null) {
    return { progress: { kind: isHydrating ? "loading" : "signed-out" }, retry };
  }
  if (activeQuery.isError || savedQuery.isError) {
    return { progress: { kind: "error" }, retry };
  }
  if (!activeQuery.data || !savedQuery.data) {
    return { progress: { kind: "loading" }, retry };
  }

  return {
    progress: getCareerProgress(careerId, activeQuery.data, savedQuery.data),
    retry,
  };
}
