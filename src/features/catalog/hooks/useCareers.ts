import { useQuery } from "@tanstack/react-query";
import { fetchCareers } from "../../../lib/api/careers.api";

export function useCareers() {
  return useQuery({
    queryKey: ["careers"],
    queryFn: () => fetchCareers(),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}