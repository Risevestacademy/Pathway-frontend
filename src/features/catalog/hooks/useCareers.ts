import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCareers } from "../../../lib/api/careers.api";
import type { FetchCareersParams } from "../../careerDetail/career.types";
import { queryKeys } from "../../../lib/queryKeys";

export function useCareers(params: FetchCareersParams) {
  return useQuery({
    queryKey: queryKeys.careers.list(params),
    queryFn: () => fetchCareers(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
