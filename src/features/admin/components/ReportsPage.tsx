import { useState } from "react";
import clsx from "clsx";
import { Info } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAdminStore } from "../adminStore";
import {
  REPORT_STATUS_LABEL,
  REPORT_TYPE_LABEL,
  dayLabel,
  isOpenReport,
  shortName,
  timeLabel,
  type ReportStatus,
} from "../admin.workflow";
import { PageHeader } from "./AdminLayout";

const REPORT_STATUS_TONE: Record<ReportStatus, "info" | "warning" | "success" | "neutral"> = {
  new: "info",
  "in-progress": "warning",
  fixed: "success",
  "not-an-issue": "neutral",
};

type Filter = "all" | ReportStatus;
const FILTERS: Filter[] = ["all", "new", "in-progress", "fixed", "not-an-issue"];

const pill = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-100 text-brand-800" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

export function ReportsPage() {
  const reports = useAdminStore((s) => s.reports);
  const members = useAdminStore((s) => s.members);
  const [filter, setFilter] = useState<Filter>("all");

  const count = (f: Filter) => (f === "all" ? reports.length : reports.filter((r) => r.status === f).length);
  // Open reports first, newest first within each group.
  const shown = reports
    .filter((r) => filter === "all" || r.status === filter)
    .sort(
      (a, b) =>
        Number(isOpenReport(b)) - Number(isOpenReport(a)) ||
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(),
    );
  const openCount = reports.filter(isOpenReport).length;

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <PageHeader title="Reports" subtitle="Problems learners flagged on resources" />

      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={pill(filter === f)}
          >
            {f === "all" ? "All" : REPORT_STATUS_LABEL[f]} {count(f)}
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
                  {["Report", "Type", "Reported", "Status", "Assigned to"].map((h) => (
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
                {shown.map((r) => {
                  const assignee = members.find((m) => m.id === r.assignedTo);
                  return (
                    <tr key={r.id}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-ink">
                          {r.title}
                          {r.count > 1 && (
                            <span className="ml-2 text-ink-muted">· {r.count} learners</span>
                          )}
                        </p>
                        <p className="text-ink-muted">
                          {r.resourceTitle} · {r.careerTitle}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-ink">{REPORT_TYPE_LABEL[r.type]}</td>
                      <td className="px-6 py-4 text-ink">
                        {dayLabel(r.reportedAt)}, {timeLabel(r.reportedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={REPORT_STATUS_TONE[r.status]}>
                          {REPORT_STATUS_LABEL[r.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-ink">
                        {assignee ? shortName(assignee.name) : "Unassigned"}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="flex items-center gap-2 border-t border-line px-6 py-4 text-sm text-ink-subtle">
          <Info className="size-4 shrink-0" aria-hidden />
          {openCount} open report{openCount === 1 ? "" : "s"}. Fixing a link closes every report
          about it.
        </p>
      </section>
    </main>
  );
}
