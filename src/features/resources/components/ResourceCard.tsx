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
        <Button
          isPrimary={false}
          type="button"
          onClick={() => window.open(resource.url, "_blank", "noopener,noreferrer")}
        >
          Open resource
          <ExternalLink className="size-5" aria-hidden />
        </Button>
      </div>
    </Card>
  );
}
