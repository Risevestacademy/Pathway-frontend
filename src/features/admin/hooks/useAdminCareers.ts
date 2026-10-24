import { useQueries } from "@tanstack/react-query";
import { fetchCareer } from "../../../lib/api/careers.api";
import { useCareers } from "../../catalog/hooks/useCareers";
import { useAdminStore } from "../adminStore";
import { toAdminRow, type AdminCareerRow } from "../admin.utils";

/**
 * Careers for the admin tables: the catalogue list plus each career's detail
 * (status, roadmap steps, source freshness), then careers created locally and
 * any local status changes on top. Detail queries share the ["career", id]
 * cache with the public career page.
 */
export function useAdminCareers() {
  const list = useCareers({});
  const items = list.data;
  const created = useAdminStore((s) => s.created);
  const statusOverrides = useAdminStore((s) => s.statusOverrides);
  const drafts = useAdminStore((s) => s.drafts);

  const details = useQueries({
    queries: (items ?? []).map((c) => ({
      queryKey: ["career", c.id],
      queryFn: () => fetchCareer(c.id),
      staleTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  const detailsPending = details.some((d) => d.isPending);
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
