import { useQuery } from "@tanstack/react-query";
import { fetchCareer } from "../../../lib/api/careers.api";
import { toCareer } from "../careerDetail.utils";

export function useCareer(careerId: string) {
  return useQuery({
    queryKey: ["career", careerId],
    queryFn: () => fetchCareer(careerId),
    select: toCareer,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}