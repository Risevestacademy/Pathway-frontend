import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCareers, type CareerFilters } from "../../../lib/api/careers.api";

export function useCareers(filters: CareerFilters) {
  return useQuery({
    queryKey: ["careers", filters.level ?? null, filters.interest ?? null],
    queryFn: () => fetchCareers(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
