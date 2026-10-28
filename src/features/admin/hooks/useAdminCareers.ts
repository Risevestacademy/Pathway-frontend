import { useQueries } from "@tanstack/react-query";
import { fetchCareer } from "../../../lib/api/careers.api";
import { useCareers } from "../../catalog/hooks/useCareers";
import { useAdminStore } from "../adminStore";
import { toAdminRow, type AdminCareerRow } from "../admin.utils";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * Careers for the admin tables: the catalogue list plus each career's detail
 * (status, roadmap steps, source freshness), then careers created locally and
 * any local status changes on top. Detail queries share the career detail
 * cache with the public career page.
 *
 * That is one request per career, so pass `detailFor` when only some rows need
 * their detail: a list of career ids, or [] when titles are enough. Fetching it
 * all in one go needs status, step count and outlook on the list endpoint.
 */
export function useAdminCareers({ detailFor = "all" }: { detailFor?: "all" | string[] } = {}) {
  const list = useCareers({});
  const items = list.data;
  const created = useAdminStore((s) => s.created);
  const statusOverrides = useAdminStore((s) => s.statusOverrides);
  const drafts = useAdminStore((s) => s.drafts);

  const details = useQueries({
    queries: (items ?? []).map((c) => ({
      queryKey: queryKeys.careers.detail(c.id),
      queryFn: () => fetchCareer(c.id),
      enabled: detailFor === "all" || detailFor.includes(c.id),
      staleTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  // Disabled queries stay pending forever; only count the ones that are loading.
  const detailsPending = details.some((d) => d.isLoading);
  const apiRows = (items ?? []).map((c, i) => toAdminRow(c, details[i].data));

  // Saved editor drafts show up in the list, like a real save would.
  const rows: AdminCareerRow[] = [...created, ...apiRows].map((row) => {
    const draft = drafts[row.id];
    return {
      ...row,
      title: draft?.details.name.trim() || row.title,
      shortDescription: draft?.details.summary.trim() || row.shortDescription,
      status: statusOverrides[row.id] ?? row.status,
      updatedAt: draft?.savedAt ?? row.updatedAt,
    };
  });

  return {
    rows,
    isPending: list.isPending || (Boolean(items?.length) && detailsPending),
    // Locally created careers are still usable if the API list fails.
    isError: list.isError && created.length === 0,
    refetch: list.refetch,
  };
}
