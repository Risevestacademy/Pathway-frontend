import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { dayLabel, timeLabel } from "../admin.workflow";
import {
  FEEDBACK_STATUS_LABEL,
  FEEDBACK_STATUS_TONE,
  feedbackStatusLabel,
  humanize,
  nextFeedbackStatuses,
  type FeedbackStatus,
} from "../adminFeedback.types";
import { useAdminFeedback, useUpdateFeedbackStatus } from "../hooks/useAdminFeedback";
import { SelectField } from "./FormFields";

const statusOption = (value: FeedbackStatus) => ({
  value,
  label: FEEDBACK_STATUS_LABEL[value],
});

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line-strong p-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ReadOnly({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-ink">{label}</span>
      <p className={`field-control text-ink ${multiline ? "min-h-24" : ""}`}>{value}</p>
    </div>
  );
}

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useAdminFeedback();
  const update = useUpdateFeedbackStatus();
  const report = data?.find((r) => r.id === reportId);

  if (isPending || isError || !report) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
        <BackButton />
        {isPending ? (
          <StateMessage kind="loading" title="Loading report" />
        ) : isError ? (
          <StateMessage
            kind="error"
            title="Couldn’t load this report"
            body="Check your connection and try again."
            action={<Button onClick={() => void refetch()}>Try again</Button>}
          />
        ) : (
          <StateMessage kind="no-match" title="Report not found" body="Go back to the reports list." />
        )}
      </main>
    );
  }

  const setStatus = (status: FeedbackStatus, thenLeave = false) =>
    update.mutate(
      { id: report.id, status },
      { onSuccess: () => thenLeave && void navigate({ to: "/admin/reports" }) },
    );

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <BackButton />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {humanize(report.category)}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-ink-muted">
            Reported {dayLabel(report.createdAt).toLowerCase()}, {timeLabel(report.createdAt)} ·{" "}
            {humanize(report.section)}
            <Badge tone={FEEDBACK_STATUS_TONE[report.status] ?? "neutral"}>
              {feedbackStatusLabel(report.status)}
            </Badge>
          </p>
        </div>
        <div className="flex gap-3">
          {report.status === "NEW" && (
            <Button
              isPrimary={false}
              disabled={update.isPending}
              onClick={() => setStatus("UNDER_REVIEW")}
            >
              Start review
            </Button>
          )}
          {report.status !== "RESOLVED" && (
            <Button disabled={update.isPending} onClick={() => setStatus("RESOLVED", true)}>
              Mark as resolved
            </Button>
          )}
        </div>
      </div>

      {update.isError && (
        <p role="alert" className="text-sm text-danger-700">
          Couldn’t update the status. Try again.
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card title="What the learner said" subtitle={`Sent from ${report.userEmail} on ${humanize(report.platform)}`}>
          <ReadOnly label="Category" value={humanize(report.category)} />
          <ReadOnly label="Message" value={report.description || "No message"} multiline />
          <ReadOnly label="Section" value={humanize(report.section)} />
        </Card>

        <Card title="What to do" subtitle="Update the status as you work through it">
          <SelectField
            label="Status"
            value={report.status as FeedbackStatus}
            onChange={(status) => status !== report.status && setStatus(status)}
            options={nextFeedbackStatuses(report.status).map(statusOption)}
            disabled={update.isPending}
          />
          {report.careerId && (
            <div className="flex flex-wrap gap-3">
              <LinkButton
                isPrimary={false}
                to="/admin/careers/$careerId"
                params={{ careerId: report.careerId }}
                search={{ tab: "Resources" }}
              >
                Open resources
              </LinkButton>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

function BackButton() {
  return (
    <LinkButton isPrimary={false} to="/admin/reports" className="self-start">
      <ChevronLeft className="size-4" aria-hidden />
      Back
    </LinkButton>
  );
}
