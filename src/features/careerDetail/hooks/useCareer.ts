import { useQuery } from "@tanstack/react-query";
import { fetchCareer } from "../../../lib/api/careers.api";
import { toCareer } from "../careerDetail.utils";
import { queryKeys } from "../../../lib/queryKeys";

export function useCareer(careerId: string) {
  return useQuery({
    queryKey: queryKeys.careers.detail(careerId),
    queryFn: () => fetchCareer(careerId),
    select: toCareer,
    staleTime: 15 * 60 * 1000,
  });
}
