import { useQuery } from "@tanstack/react-query";
import { fetchCareers } from "../../../lib/api/careers.api";
import type { ApiTargetLevel } from "../catelog.types";

interface UseCareersParams {
  level?: ApiTargetLevel;
  interest?: string;
}

export function useCareers(params: UseCareersParams) {
  return useQuery({
    queryKey: ["careers", params],
    queryFn: () => fetchCareers(params),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}