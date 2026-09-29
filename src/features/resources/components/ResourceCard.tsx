import {
  BookOpen,
  ExternalLink,
  FileText,
  Flag,
  GraduationCap,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
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
    course: GraduationCap,
    documentation: BookOpen,
    video: Video,
  };
  const Icon = icons[resource.kind];
  const costTone = resource.costLabel?.toLowerCase().includes("free")
    ? "success"
    : resource.costLabel?.toLowerCase().includes("paid")
      ? "warning"
      : "unavailable";
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
          <p className="mt-1 text-base text-ink-muted">{resource.provider}</p>

          {(resource.costLabel || resource.certificationLabel) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {[resource.costLabel, resource.certificationLabel]
                .filter((label): label is string => Boolean(label))
                .map((label) => (
                  <Badge
                    key={label}
                    tone={costTone}
                  >
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
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border-[0.5px] border-grey-200 bg-grey-50 px-5 py-3 text-base font-medium text-grey-500 shadow-sm transition-colors hover:bg-grey-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Open resource
          <ExternalLink className="size-5" aria-hidden />
        </a>
      </div>
    </Card>
  );
}
