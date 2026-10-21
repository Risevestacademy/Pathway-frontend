import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchOnboardingOptions } from "../../../lib/api/onboarding.api";

export const onboardingOptionsQuery = queryOptions({
  queryKey: ["onboarding-options"],
  queryFn: fetchOnboardingOptions,
  staleTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
});

export function useOnboardingOptions() {
  return useQuery(onboardingOptionsQuery);
}