import {
  CheckCircle2,
  BookOpen,
  Award,
  ExternalLink,
  FileText,
  Flag,
  MonitorPlay,
  Sparkles,
  BookMarked,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useCallback, useEffect, useState } from "react";
import type { Resource } from "../resources.types";
import { analytics } from "@/lib/monitoring/events";
import { useMutation } from "@tanstack/react-query";
import {
  submitFeedback,
  type FeedbackCategory,
} from "../../../lib/api/feedback.api";
import { useAuthStore } from "../../../lib/stores/authStore";

/** Where the resource appears, so a report reaches the right career. */
export interface ReportContext {
  careerId: string;
  careerTitle: string;
  stepTitle: string;
}

const REPORT_REASON_CATEGORY: Record<string, FeedbackCategory> = {
  "Link is broken or doesn’t load": "BROKEN_LINK",
  "Content is outdated": "INCORRECT_CONTENT",
  "Doesn’t match this step": "INCORRECT_CONTENT",
  "Something else": "OTHER",
};

interface ResourceCardProps {
  resource: Resource;
  context?: ReportContext;
}

export default function ResourceCard({ resource, context }: ResourceCardProps) {
  const userEmail = useAuthStore((s) => s.user?.email);
  const feedback = useMutation({ mutationFn: submitFeedback });
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
    book: BookMarked,
    certification: Award,
  };
  const kindLabels: Record<Resource["kind"], string> = {
    article: "Article",
    course: "Course",
    documentation: "Docs",
    interactive: "Interactive",
    video: "Video",
    book: "Book",
    certification: "Certification",
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

  const { reset: resetFeedback } = feedback;
  // Clears the last error too, so it doesn't show again when the dialog reopens.
  const closeReport = useCallback(() => {
    setIsReportOpen(false);
    setReason("");
    setDetails("");
    resetFeedback();
  }, [resetFeedback]);

  useEffect(() => {
    if (!isReportOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReport();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isReportOpen, closeReport]);

  const submitReport = () => {
    if (!reason) return;
    // The API has no resource field, so the description says which resource it is about.
    const note = details.trim() || reason;
    feedback.mutate(
      {
        category: REPORT_REASON_CATEGORY[reason] ?? "OTHER",
        description: context
          ? `${note} (Resource: ${resource.title}, step: ${context.stepTitle})`
          : `${note} (Resource: ${resource.title})`,
        section: "RESOURCES",
        careerId: context?.careerId,
        userEmail,
        platform: "WEB",
      },
      {
        onSuccess: () => {
          closeReport();
          setReportSubmitted(true);
        },
      },
    );
  };

  const trackResourceOpened = () => {
    analytics.trackFeature.resourceOpened(
      resource.id,
      resource.title,
      resource.provider,
      resource.kind,
    );
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
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackResourceOpened}
          onAuxClick={(event) => {
            if (event.button === 1) trackResourceOpened();
          }}
          className="
            inline-flex items-center justify-center gap-2
            rounded-md border-[0.5px] border-grey-200 bg-grey-50
            px-4 py-2 text-sm font-sans font-semibold text-grey-500
            inset-shadow-secondary-btn transition-[box-shadow,transform,background-color,color] duration-100
            hover:bg-[color-mix(in_oklab,var(--color-grey-50),var(--color-grey-100)_50%)] hover:text-ink
            active:translate-y-[2px] active:inset-shadow-secondary-btn-pressed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
          "
        >
          <span>Open resource</span>
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
      {isReportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReport();
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
                onClick={closeReport}
                className="rounded-md p-1 text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitReport();
              }}
            >
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

              {feedback.isError && (
                <p role="alert" className="mt-4 text-sm text-danger-700">
                  We couldn’t send your report. Please try again.
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button isPrimary={false} type="button" onClick={closeReport}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!reason || feedback.isPending}>
                  Send report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
