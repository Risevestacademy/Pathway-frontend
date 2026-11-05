import { useId } from "react";
import { Info } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { LinkButton } from "../../../components/ui/Button";
import { formatCheckedDate } from "../resourceDetail.utils";
import type { GroupedResource } from "../resourceGroups.utils";
import { KIND_LABEL } from "../resourceLabels";

function PaidCourse({ careerId, resource }: { careerId: string; resource: GroupedResource }) {
  const headingId = useId();
  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-3xl border border-brand-100 bg-brand-50/40 p-5"
    >
      <div className="flex flex-wrap gap-2">
        <Badge tone="warning">Paid</Badge>
        <Badge tone="brand">
          {resource.kind === "certification" ? "Certificate" : KIND_LABEL[resource.kind]}
        </Badge>
      </div>

      <div>
        <h3 id={headingId} className="font-display text-base font-medium text-ink">
          {resource.title}
        </h3>
        <p className="text-sm text-ink-muted">by {resource.provider}</p>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-y border-line py-4">
        {resource.description && <p className="text-sm text-ink">{resource.description}</p>}
        <p className="text-sm text-ink-muted">
          Price on the provider’s site · checked {formatCheckedDate(resource.lastChecked)}
        </p>
      </div>

      <LinkButton
        to="/my-pathway/$careerId/resources/$resourceId"
        params={{ careerId, resourceId: resource.id }}
        isPrimary={false}
        className="w-fit"
      >
        View course
        <span className="sr-only">: {resource.title}</span>
      </LinkButton>
    </article>
  );
}

/** A step's paid resources, offered as extras that its progress never depends on. */
export function PaidCoursesCard({
  careerId,
  resources,
  hasFreeResources,
}: {
  careerId: string;
  resources: GroupedResource[];
  /** Whether the step also has free resources, which decides what the intro can honestly say. */
  hasFreeResources: boolean;
}) {
  const headingId = useId();
  if (resources.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          Optional: paid courses to go further
        </h2>
        <span className="rounded-lg bg-grey-100 px-2.5 py-1 text-sm text-ink-muted">
          Not part of your steps
        </span>
      </div>

      <p className="text-sm text-ink-muted">
        {hasFreeResources ? "Every step above can be finished for free. " : ""}
        These courses are extra if you want more depth and can afford them. Your progress never
        depends on them.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource) => (
          <PaidCourse key={resource.id} careerId={careerId} resource={resource} />
        ))}
      </div>

      <p className="flex items-center gap-2 text-sm text-ink-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        Pathway does not sell courses or take payment. Prices are set by each provider.
      </p>
    </section>
  );
}
