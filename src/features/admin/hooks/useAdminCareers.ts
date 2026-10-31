import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchAdminCareer, fetchAllAdminCareers } from "../../../lib/api/adminCareers.api";
import { useAdminStore } from "../adminStore";
import { toAdminRowFromList, type AdminCareerRow } from "../admin.utils";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * Careers for the admin tables: every career in any status from
 * GET /admin/careers (so drafts and retired ones show up), plus each career's
 * detail (summary, roadmap steps, source freshness), then careers created
 * locally in older versions and any local status changes on top.
 *
 * That is one request per career, so pass `detailFor` when only some rows need
 * their detail: a list of career ids, or [] when titles are enough. Fetching it
 * all in one go needs step count and outlook on the list endpoint.
 */
export function useAdminCareers({ detailFor = "all" }: { detailFor?: "all" | string[] } = {}) {
  const list = useQuery({
    queryKey: queryKeys.admin.careers.list,
    queryFn: fetchAllAdminCareers,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const items = list.data;
  const created = useAdminStore((s) => s.created);
  const statusOverrides = useAdminStore((s) => s.statusOverrides);
  const drafts = useAdminStore((s) => s.drafts);

  const details = useQueries({
    queries: (items ?? []).map((c) => ({
      queryKey: queryKeys.admin.careers.detail(c.id),
      queryFn: () => fetchAdminCareer(c.id),
      enabled: detailFor === "all" || detailFor.includes(c.id),
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  // Disabled queries stay pending forever; only count the ones that are loading.
  const detailsPending = details.some((d) => d.isLoading);
  const apiRows = (items ?? []).map((c, i) => toAdminRowFromList(c, details[i].data?.detail));

  // Saved editor drafts show up in the list, like a real save would.
  // Careers made in the browser before drafts were created on the server stay until deleted.
  const apiIds = new Set(apiRows.map((row) => row.id));
  const localRows = created.filter((row) => !apiIds.has(row.id));
  const rows: AdminCareerRow[] = [...localRows, ...apiRows].map((row) => {
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
