import { useQueries } from "@tanstack/react-query";
import { fetchCareer } from "@/lib/api/careers.api";
import { toCareer } from "@/features/careerDetail/careerDetail.utils";
import type { Career } from "@/types/career.types";

/**
 * Detail for each listed career, keyed by id. The list endpoint has no skills
 * or field, so the explore cards read them from the detail endpoint. The
 * queries share `["career", id]` with useCareer, so opening a career page
 * afterwards is instant.
 */
export function useCareerDetails(ids: string[]): Map<string, Career> {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["career", id],
      queryFn: () => fetchCareer(id),
      select: toCareer,
      staleTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
    combine: (results) => {
      const byId = new Map<string, Career>();
      results.forEach((result, index) => {
        if (result.data) byId.set(ids[index], result.data);
      });
      return byId;
    },
  });
}
