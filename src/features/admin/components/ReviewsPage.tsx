import { Info } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAdminStore } from "../adminStore";
import { REVIEW_TYPE_LABEL, waitingLabel, type ReviewType } from "../admin.workflow";
import { PageHeader } from "./AdminLayout";

const REVIEW_TONE: Record<ReviewType, "info" | "brand" | "warning" | "neutral"> = {
  "new-career": "info",
  roadmap: "brand",
  figures: "warning",
  details: "neutral",
};

export function ReviewsPage() {
  const reviews = useAdminStore((s) => s.reviews);
  const pending = reviews
    .filter((r) => r.status === "pending")
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  // Reviews of a deleted career stay listed for transparency, but nobody can act on them.
  const actionable = pending.filter((r) => !r.careerDeletedAt).length;

  return (
    <main className="flex flex-1 flex-col gap-8 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <PageHeader title="Inbox" subtitle="Changes waiting for approval" />

      <section className="overflow-hidden rounded-3xl border border-line-strong">
        {pending.length === 0 ? (
          <StateMessage
            kind="empty"
            title="You’re all caught up"
            body="Changes submitted for review will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-muted text-ink-muted">
                <tr>
                  {["Change", "Type", "Submitted by", "Waiting"].map((h) => (
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
                {pending.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4">
                      <p className={r.careerDeletedAt ? "font-medium text-ink-muted" : "font-medium text-ink"}>
                        {r.title}
                      </p>
                      <p className="text-ink-muted">{r.summary}</p>
                      {r.careerDeletedAt && (
                        <p className="mt-1">
                          <Badge tone="danger">Career deleted</Badge>
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={REVIEW_TONE[r.type]}>{REVIEW_TYPE_LABEL[r.type]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-ink">{r.submittedBy}</td>
                    <td className="px-6 py-4 text-ink">{waitingLabel(r.submittedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      {r.careerDeletedAt ? (
                        <span className="text-ink-muted">Unavailable</span>
                      ) : (
                        <LinkButton
                          isPrimary={false}
                          to="/admin/reviews/$reviewId"
                          params={{ reviewId: r.id }}
                        >
                          Review
                        </LinkButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="flex items-center gap-2 border-t border-line px-6 py-4 text-sm text-ink-subtle">
          <Info className="size-4 shrink-0" aria-hidden />
          {actionable} change{actionable === 1 ? "" : "s"} waiting. You can’t approve your
          own changes. Only people with the Reviewer role can approve.
        </p>
      </section>
    </main>
  );
}
