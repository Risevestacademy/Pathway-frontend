import { Button } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { CatalogueView } from "../catalog.utils";

interface CatalogueEmptyStateProps {
  view: CatalogueView;
  interestLabel: string | null;
  levelLabel?: string;
  onShowAll: () => void;
}

/** Shown when the current view returns no careers. */
export function CatalogueEmptyState({
  view,
  interestLabel,
  levelLabel,
  onShowAll,
}: CatalogueEmptyStateProps) {
  const seeAll = <Button onClick={onShowAll}>See all careers</Button>;

  if (view === "recommended") {
    return (
      <StateMessage
        kind="no-match"
        title="No careers match your interest yet"
        body={
          levelLabel
            ? `We don’t have ${interestLabel} careers for ${levelLabel.toLowerCase()}s yet. Change your filters, or see all careers to browse the full catalogue.`
            : `We don’t have ${interestLabel} careers yet. Change your filters, or see all careers to browse the full catalogue.`
        }
        action={seeAll}
      />
    );
  }

  if (view === "level" && levelLabel) {
    return (
      <StateMessage
        kind="no-match"
        title={`No careers for ${levelLabel.toLowerCase()}s yet`}
        body="Try another level, or see all careers to browse the full catalogue."
        action={seeAll}
      />
    );
  }

  return (
    <StateMessage
      kind="empty"
      title="No careers available yet"
      body="We're adding careers to the catalogue. Check back soon."
    />
  );
}
