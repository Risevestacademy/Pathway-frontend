import {
  BookOpen,
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
import type { Resource } from "../resources.types";

interface ResourceCardProps {
  resource: Resource;
  careerId: string;
  stepId: string;
}

export default function ResourceCard({
  resource,
  careerId,
  stepId,
}: ResourceCardProps) {
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
  const reportSubject = encodeURIComponent(`Resource issue: ${resource.title}`);
  const reportBody = encodeURIComponent(
    `Career: ${careerId}\nStep: ${stepId}\nResource: ${resource.title} (${resource.id})`,
  );

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
        <a
          href={`mailto:support@pathway.example?subject=${reportSubject}&body=${reportBody}`}
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <Flag className="size-4" aria-hidden />
          Report an issue with this resource
        </a>
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
    </Card>
  );
}
