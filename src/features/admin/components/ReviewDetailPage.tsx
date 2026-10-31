import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { Button, LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAdminStore } from "../adminStore";
import { useCurrentMember } from "../hooks/useCurrentMember";
import { waitingLabel, type ReviewItem } from "../admin.workflow";
import { Banner } from "./Banner";
import { TextAreaField } from "./FormFields";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-ink">{label}</span>
      <p className="field-control text-ink-muted">{value || "—"}</p>
    </div>
  );
}

function SnapshotCard({
  title,
  subtitle,
  highlighted,
  fields,
}: {
  title: string;
  subtitle: string;
  highlighted?: boolean;
  fields: { label: string; value: string }[];
}) {
  return (
    <section
      className={clsx(
        "flex flex-col gap-5 rounded-3xl border p-6",
        highlighted ? "border-2 border-brand-600" : "border-line-strong",
      )}
    >
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
      </div>
      {fields.map((f) => (
        <ReadOnlyField key={f.label} {...f} />
      ))}
    </section>
  );
}

export function ReviewDetailPage({ reviewId }: { reviewId: string }) {
  const navigate = useNavigate();
  const review = useAdminStore((s) => s.reviews.find((r) => r.id === reviewId));
  const decideReview = useAdminStore((s) => s.decideReview);
  const setStatus = useAdminStore((s) => s.setStatus);
  const { displayName, canReview } = useCurrentMember();
  const [note, setNote] = useState("");

  if (!review) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
        <BackButton />
        <StateMessage
          kind="no-match"
          title="Review not found"
          body="It may have already been handled. Go back to the inbox."
        />
      </main>
    );
  }

  const isOwn = review.submittedBy === displayName;
  const decided = review.status !== "pending";
  const blockedReason = decided
    ? null
    : isOwn
      ? "You can’t approve or send back your own changes. Ask another reviewer."
      : !canReview
        ? "Only people with the Reviewer role can approve or send back changes."
        : null;

  const decide = (status: "approved" | "changes-requested", item: ReviewItem) => {
    decideReview(item.id, status, note);
    // A first-publish approval makes the career visible to learners.
    if (status === "approved" && item.type === "new-career" && item.careerId) {
      setStatus(item.careerId, "published");
    }
    void navigate({ to: "/admin/reviews" });
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <BackButton />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {review.title}
          </h1>
          <p className="mt-2 text-ink-muted">
            Submitted by {review.submittedBy} · {waitingLabel(review.submittedAt)} ago
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            isPrimary={false}
            disabled={decided || blockedReason !== null}
            onClick={() => decide("changes-requested", review)}
          >
            Request changes
          </Button>
          <Button
            disabled={decided || blockedReason !== null}
            onClick={() => decide("approved", review)}
          >
            Approve and publish
          </Button>
        </div>
      </div>

      {decided && (
        <Banner
          tone={review.status === "approved" ? "success" : "warning"}
          title={review.status === "approved" ? "Approved and published" : "Changes requested"}
        >
          {review.decisionNote || "No note was left for the author."}
        </Banner>
      )}
      {blockedReason && (
        <Banner tone="warning" title="You can’t decide on this one">
          {blockedReason}
        </Banner>
      )}

      {review.changes.length > 0 ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <SnapshotCard
            title="Before"
            subtitle="Published"
            fields={review.changes.map((c) => ({ label: c.label, value: c.before }))}
          />
          <SnapshotCard
            title="After"
            subtitle="Proposed"
            highlighted
            fields={review.changes.map((c) => ({ label: c.label, value: c.after }))}
          />
        </div>
      ) : (
        <SnapshotCard
          title="What’s being submitted"
          subtitle="Proposed"
          highlighted
          fields={[{ label: "Summary", value: review.summary }]}
        />
      )}

      <section className="flex flex-col gap-5 rounded-3xl border border-line-strong p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Your decision</h2>
        <TextAreaField
          label="Note to the author (optional)"
          value={decided ? (review.decisionNote ?? "") : note}
          onChange={setNote}
          placeholder="For example: please add the survey sample size"
        />
      </section>

      {review.bannerTitle && (
        <Banner tone="info" title={review.bannerTitle}>
          {review.bannerBody}
        </Banner>
      )}

      {(review.careerId || review.revisionId) && (
        <div className="flex flex-wrap gap-3 self-start">
          {review.revisionId && (
            <LinkButton
              isPrimary={false}
              to="/admin/revisions/$revisionId"
              params={{ revisionId: review.revisionId }}
            >
              View full diff
            </LinkButton>
          )}
          {review.careerId && (
            <LinkButton
              isPrimary={false}
              to="/admin/careers/$careerId"
              params={{ careerId: review.careerId }}
            >
              Open in editor
            </LinkButton>
          )}
        </div>
      )}
    </main>
  );
}

function BackButton() {
  return (
    <LinkButton isPrimary={false} to="/admin/reviews" className="self-start">
      <ChevronLeft className="size-4" aria-hidden />
      Back
    </LinkButton>
  );
}
