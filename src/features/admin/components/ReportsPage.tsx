import { useState } from "react";
import clsx from "clsx";
import { Info } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { paginate } from "../admin.utils";
import { dayLabel, timeLabel } from "../admin.workflow";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_TONE,
  feedbackStatusLabel,
  humanize,
  isOpenFeedback,
  type FeedbackStatus,
} from "../adminFeedback.types";
import { useAdminFeedback } from "../hooks/useAdminFeedback";
import { PageHeader } from "./AdminLayout";
import { Pagination } from "./Pagination";

type Filter = "all" | FeedbackStatus;
const FILTERS: Filter[] = ["all", ...FEEDBACK_STATUSES];

const pill = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-100 text-brand-800" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

export function ReportsPage() {
  const { data, isPending, isError, refetch } = useAdminFeedback();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const reports = data ?? [];
  const count = (f: Filter) => (f === "all" ? reports.length : reports.filter((r) => r.status === f).length);
  // Open reports first, newest first within each group.
  const shown = reports
    .filter((r) => filter === "all" || r.status === filter)
    .sort(
      (a, b) =>
        Number(isOpenFeedback(b)) - Number(isOpenFeedback(a)) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const current = paginate(shown, page);
  const openCount = reports.filter(isOpenFeedback).length;

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <PageHeader title="Reports" subtitle="Problems learners flagged on resources" />

      {isPending ? (
        <StateMessage kind="loading" title="Loading reports" />
      ) : isError ? (
        <StateMessage
          kind="error"
          title="Couldn’t load reports"
          body="Check your connection and try again."
          action={<Button onClick={() => void refetch()}>Try again</Button>}
        />
      ) : (
        <>
          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={pill(filter === f)}
              >
                {f === "all" ? "All" : feedbackStatusLabel(f)} {count(f)}
              </button>
            ))}
          </div>

          <section className="overflow-hidden rounded-3xl border border-line-strong">
            {shown.length === 0 ? (
              <StateMessage
                kind="empty"
                title="No reports here"
                body="When learners flag a resource, their reports will show up here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-surface-muted text-ink-muted">
                    <tr>
                      {["Report", "Category", "Reported", "Status"].map((h) => (
                        <th key={h} scope="col" className="px-6 py-4 font-medium">
                          {h}
                        </th>
                      ))}
                      <th scope="col" className="px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {current.items.map((r) => (
                      <tr key={r.id}>
                        <td className="max-w-sm px-6 py-4">
                          <p className="line-clamp-2 font-medium text-ink">{r.description}</p>
                          <p className="text-ink-muted">
                            {r.userEmail} · {humanize(r.platform)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-ink">
                          {humanize(r.category)}
                          <p className="text-ink-muted">{humanize(r.section)}</p>
                        </td>
                        <td className="px-6 py-4 text-ink">
                          {dayLabel(r.createdAt)}, {timeLabel(r.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={FEEDBACK_STATUS_TONE[r.status] ?? "neutral"}>
                            {feedbackStatusLabel(r.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <LinkButton
                            isPrimary={false}
                            to="/admin/reports/$reportId"
                            params={{ reportId: r.id }}
                          >
                            Open
                          </LinkButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {shown.length > 0 && (
              <Pagination
                page={current.page}
                pageCount={current.pageCount}
                shown={current.items.length}
                total={shown.length}
                noun="reports"
                onPage={setPage}
              />
            )}
            <p className="flex items-center gap-2 border-t border-line px-6 py-4 text-sm text-ink-subtle">
              <Info className="size-4 shrink-0" aria-hidden />
              {openCount} open report{openCount === 1 ? "" : "s"}.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
