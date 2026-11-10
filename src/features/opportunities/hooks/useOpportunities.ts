import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { FetchOpportunitiesParams } from "../opportunities.type";
import { queryKeys } from "@/lib/queryKeys";
import { fetchOpportunities } from "@/lib/api/opportunities.api";

export function useOpportunities(params: FetchOpportunitiesParams) {
  return useQuery({
    queryKey: queryKeys.opportunities.list(params),
    queryFn: () => fetchOpportunities(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
