import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchOnboardingOptions } from "../../../lib/api/onboarding.api";
import { queryKeys } from "../../../lib/queryKeys";

export const onboardingOptionsQuery = queryOptions({
  queryKey: queryKeys.onboardingOptions,
  queryFn: fetchOnboardingOptions,
  staleTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
});

export function useOnboardingOptions() {
  return useQuery(onboardingOptionsQuery);
}