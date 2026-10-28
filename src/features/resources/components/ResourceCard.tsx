import {
  BookOpen,
  Award,
  ExternalLink,
  FileText,
  MonitorPlay,
  Sparkles,
  BookMarked,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import type { Resource } from "../resources.types";
import { ReportIssueLink } from "../../feedback/components/ReportIssueLink";
import { REPORT_REASONS } from "../../feedback/feedback.utils";

/** Where the resource appears, so a report reaches the right career. */
export interface ReportContext {
  careerId: string;
  careerTitle: string;
  stepTitle: string;
}

interface ResourceCardProps {
  resource: Resource;
  context?: ReportContext;
}

export default function ResourceCard({
  resource,
  context,
}: ResourceCardProps) {
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
        <ReportIssueLink
          label="Report an issue with this resource"
          sentLabel="Thanks, we’ll review this resource"
          section="RESOURCES"
          reasons={REPORT_REASONS.RESOURCES}
          careerId={context?.careerId}
          subject={resource.title}
          contextNote={
            context
              ? `Resource: ${resource.title}, step: ${context.stepTitle}`
              : `Resource: ${resource.title}`
          }
          note="The resource stays available while our team reviews your report."
        />
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
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
    </Card>
  );
}
