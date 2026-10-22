import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { StateMessage } from "../../../components/ui/StateMessage";
import { isValidUrl } from "../admin.editor";
import { useAdminStore } from "../adminStore";
import { useAdminCareers } from "../hooks/useAdminCareers";
import {
  REPORT_STATUS_LABEL,
  REPORT_TYPE_LABEL,
  dayLabel,
  shortName,
  timeLabel,
  type ReportStatus,
} from "../admin.workflow";
import { formatDate } from "../admin.utils";
import { Banner } from "./Banner";
import { SelectField, TextAreaField, TextField } from "./FormFields";

const UNASSIGNED = "__none__";

const STATUS_OPTIONS = (Object.keys(REPORT_STATUS_LABEL) as ReportStatus[]).map((value) => ({
  value,
  label: REPORT_STATUS_LABEL[value],
}));

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
  const report = useAdminStore((s) => s.reports.find((r) => r.id === reportId));
  const members = useAdminStore((s) => s.members);
  const updateReport = useAdminStore((s) => s.updateReport);
  const closeReport = useAdminStore((s) => s.closeReport);
  const { rows } = useAdminCareers();
  const [replacing, setReplacing] = useState(false);

  if (!report) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
        <BackButton />
        <StateMessage kind="no-match" title="Report not found" body="Go back to the reports list." />
      </main>
    );
  }

  // Learner reports carry the career's id; seed reports are matched by name.
  const careerId = report.careerId ?? rows.find((r) => r.title === report.careerTitle)?.id ?? null;
  const isLink = report.type === "link-problem";
  const noun = isLink ? "link" : "resource";

  const finish = (status: "fixed" | "not-an-issue") => {
    closeReport(report.id, status);
    void navigate({ to: "/admin/reports" });
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <BackButton />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {report.title}
          </h1>
          <p className="mt-2 text-ink-muted">
            Reported {dayLabel(report.reportedAt).toLowerCase()}, {timeLabel(report.reportedAt)} ·{" "}
            {report.resourceTitle}
          </p>
        </div>
        <div className="flex gap-3">
          <Button isPrimary={false} onClick={() => finish("not-an-issue")}>
            Not an issue
          </Button>
          <Button onClick={() => finish("fixed")}>Mark as fixed</Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card
          title="What the learner said"
          subtitle={`Sent from the roadmap topic “${report.stepTitle}”`}
        >
          <ReadOnly label="Report type" value={REPORT_TYPE_LABEL[report.type]} />
          <ReadOnly label="Message" value={report.message || "No message"} multiline />
          <ReadOnly label="Career" value={report.careerTitle} />
        </Card>

        <Card
          title="What to do"
          subtitle={isLink ? "Fix the link or replace the resource" : "Check the resource and update it if needed"}
        >
          <SelectField
            label="Status"
            value={report.status}
            onChange={(status) => updateReport(report.id, { status })}
            options={STATUS_OPTIONS}
          />
          <SelectField
            label="Assigned to"
            value={report.assignedTo ?? UNASSIGNED}
            onChange={(v) => updateReport(report.id, { assignedTo: v === UNASSIGNED ? null : v })}
            options={[
              { value: UNASSIGNED, label: "Unassigned" },
              ...members
                .filter((m) => m.lastActive)
                .map((m) => ({ value: m.id, label: shortName(m.name) })),
            ]}
          />
          <TextAreaField
            label="Note for the team"
            value={report.note}
            onChange={(note) => updateReport(report.id, { note })}
            placeholder="For example: replaced with the freeCodeCamp course"
          />
          <div className="flex flex-wrap gap-3">
            {careerId && (
              <LinkButton
                isPrimary={false}
                to="/admin/careers/$careerId"
                params={{ careerId }}
                search={{ tab: "Resources" }}
              >
                Open resources
              </LinkButton>
            )}
            {isLink && (
              <Button isPrimary={false} onClick={() => setReplacing(true)}>
                Replace link
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Banner
        tone="info"
        title={
          report.count > 1
            ? `${report.count} learners reported this ${noun}`
            : `1 learner reported this ${noun}`
        }
      >
        {report.brokenCheckedOn
          ? `The weekly link check also marked it broken on ${formatDate(report.brokenCheckedOn)}. `
          : ""}
        {report.count > 1
          ? `Fixing it closes all ${report.count} reports.`
          : "Fixing it closes this report."}
      </Banner>

      <ReplaceLinkDialog
        open={replacing}
        onClose={() => setReplacing(false)}
        onSave={(url) => {
          const { replaceResourceLink } = useAdminStore.getState();
          if (careerId && report.resourceId) replaceResourceLink(careerId, report.resourceId, url);
          updateReport(report.id, {
            note: [report.note, `Link replaced with ${url}`].filter(Boolean).join("\n"),
          });
          setReplacing(false);
          finish("fixed");
        }}
      />
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

function ReplaceLinkDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Replace link"
      description="The new link is saved on the resource and this report is marked as fixed."
    >
      {open && <ReplaceLinkForm onSave={onSave} onClose={onClose} />}
    </Dialog>
  );
}

function ReplaceLinkForm({ onSave, onClose }: { onSave: (url: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [attempted, setAttempted] = useState(false);
  const error = !url.trim()
    ? "Add the new link. Required."
    : isValidUrl(url)
      ? undefined
      : "Enter a full link starting with https://";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!error) onSave(url.trim());
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
      <TextField
        label="New link"
        type="url"
        value={url}
        onChange={setUrl}
        placeholder="https://"
        error={attempted ? error : undefined}
      />
      <div className="flex gap-3">
        <Button type="submit">Replace and mark fixed</Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
