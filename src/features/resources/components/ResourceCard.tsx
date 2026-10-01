import {
  CheckCircle2,
  BookOpen,
  X,
  ExternalLink,
  FileText,
  Flag,
  MonitorPlay,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useState } from "react";
import type { Resource } from "../resources.types";

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const icons: Record<Resource["kind"], LucideIcon> = {
    article: FileText,
    course: BookOpen,
    documentation: FileText,
    interactive: Sparkles,
    video: MonitorPlay,
  };
  const kindLabels: Record<Resource["kind"], string> = {
    article: "Article",
    course: "Course",
    documentation: "Docs",
    interactive: "Interactive",
    video: "Video",
  };
  const Icon = icons[resource.kind];
  const getCostTone = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("free")) return "success" as const;
    if (normalized.includes("paid")) return "warning" as const;
    return "unavailable" as const;
  };
  const reportReasons = [
    "Link is broken or doesn’t load",
    "Content is outdated",
    "Doesn’t match this step",
    "Something else",
  ];

  const submitReport = () => {
    if (!reason) return;
    setIsReportOpen(false);
    setReportSubmitted(true);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-5">
        <div
          className="grid size-14 shrink-0 place-items-center rounded-lg bg-surface-muted text-ink-muted"
          aria-hidden
        >
          <Icon className="size-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-ink">
            {resource.title}
          </h2>
          <p className="mt-1 text-base text-ink-muted">
            {resource.provider} · {kindLabels[resource.kind]}
          </p>

          {(resource.costLabel || resource.certificationLabel) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {[resource.costLabel, resource.certificationLabel]
                .filter((label): label is string => Boolean(label))
                .map((label) => (
                  <Badge key={label} tone={getCostTone(label)}>
                    {label}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          {reportSubmitted ? (
            <>
              <CheckCircle2 className="size-4 text-success-600" aria-hidden />
              <span className="text-success-700">
                Thanks, we&apos;ll review this resource
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2 hover:underline">
              <Flag className="size-4" aria-hidden />
              Report an issue with this resource
            </span>
          )}
        </button>
        <Button
          isPrimary={false}
          type="button"
          className="gap-2"
          onClick={() =>
            window.open(resource.url, "_blank", "noopener,noreferrer")
          }
        >
          <span>Open resource</span>
          <ExternalLink className="size-4" aria-hidden />
        </Button>
      </div>
      {isReportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsReportOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`report-title-${resource.id}`}
            className="w-full max-w-xl rounded-2xl bg-surface p-6 shadow-overlay"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id={`report-title-${resource.id}`}
                  className="font-display text-2xl font-semibold text-ink"
                >
                  Report an issue
                </h2>
                <p className="mt-1 text-base text-ink-muted">
                  {resource.title}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close report dialog"
                onClick={() => setIsReportOpen(false)}
                className="rounded-md p-1 text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <fieldset className="mt-6 grid gap-2">
              <legend className="sr-only">
                What is wrong with this resource?
              </legend>
              {reportReasons.map((reportReason) => (
                <label
                  key={reportReason}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border border-line px-4 py-4 text-base text-ink hover:border-brand-300"
                >
                  <input
                    type="radio"
                    name={`report-reason-${resource.id}`}
                    value={reportReason}
                    checked={reason === reportReason}
                    onChange={(event) => setReason(event.target.value)}
                    className="size-4 accent-brand-600"
                  />
                  {reportReason}
                </label>
              ))}
            </fieldset>

            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Add details (optional)"
              rows={4}
              className="mt-4 w-full resize-y rounded-lg border border-line bg-surface px-4 py-3 text-base placeholder:text-ink-placeholder focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15"
            />
            <p className="mt-4 text-sm text-ink-muted">
              The resource stays available while our team reviews your report.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button isPrimary={false} onClick={() => setIsReportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReport} disabled={!reason}>
                Send report
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
