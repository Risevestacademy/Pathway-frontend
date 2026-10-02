import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCareers } from "../../../lib/api/careers.api";
import type { FetchCareersParams } from "../../careerDetail/career.types";

export function useCareers(params: FetchCareersParams) {
  return useQuery({
    queryKey: ["careers", params],
    queryFn: () => fetchCareers(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
