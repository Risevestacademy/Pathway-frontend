import { Badge } from "../../../components/ui/Badge";
import { LinkButton } from "../../../components/ui/Button";
import { formatCheckedDate } from "../resourceDetail.utils";
import type { GroupedResource } from "../resourceGroups.utils";
import { KIND_LABEL, costChip, costTone } from "../resourceLabels";

/** One resource in a step: a tick box, what it is, and a way into its details. */
export function ResourceRow({
  careerId,
  resource,
  ticked,
  unsaved,
  onToggle,
}: {
  careerId: string;
  resource: GroupedResource;
  ticked: boolean;
  /** Whether the browser couldn't save this tick. */
  unsaved: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <input
        type="checkbox"
        checked={ticked}
        onChange={onToggle}
        aria-label={`I have done ${resource.title}`}
        className="focus-ring size-6 shrink-0 cursor-pointer rounded-md border border-line-strong accent-brand-600"
      />

      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-medium text-ink">{resource.title}</p>
        <p className="text-ink-muted">by {resource.provider}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{KIND_LABEL[resource.kind]}</Badge>
          {resource.costLabel && (
            <Badge tone={costTone(resource.costLabel)}>{costChip(resource.costLabel)}</Badge>
          )}
          <span className="text-sm text-ink-muted">
            Checked {formatCheckedDate(resource.lastChecked)}
          </span>
        </div>
      </div>

      {unsaved && <Badge tone="warning">Not saved</Badge>}

      <LinkButton
        to="/my-pathway/$careerId/resources/$resourceId"
        params={{ careerId, resourceId: resource.id }}
        isPrimary={false}
        className="shrink-0"
      >
        View details
        <span className="sr-only">: {resource.title}</span>
      </LinkButton>
    </div>
  );
}
