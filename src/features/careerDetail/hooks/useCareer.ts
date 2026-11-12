import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCareer } from "../../../lib/api/careers.api";
import type { PublicCareerDetailDto } from "../career.types";
import { toCareer } from "../careerDetail.utils";
import { queryKeys } from "../../../lib/queryKeys";

export function useCareer(careerId: string) {
  const select = useCallback(
    (data: PublicCareerDetailDto) => toCareer(data, careerId),
    [careerId],
  );
  return useQuery({
    queryKey: queryKeys.careers.detail(careerId),
    queryFn: () => fetchCareer(careerId),
    select,
    staleTime: 15 * 60 * 1000,
  });
}
