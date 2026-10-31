import { ChevronLeft } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useRevisionDiff } from "../hooks/useRevisionDiff";
import {
  changedSections,
  describeDiffItem,
  formatDiffValue,
  noticeText,
  sectionLabel,
  type DiffChange,
  type DiffItem,
  type DiffSection,
} from "../revisionDiff.types";
import { Banner } from "./Banner";

const page = "flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8";

function BackButton() {
  return (
    <LinkButton isPrimary={false} to="/admin/reviews" className="self-start">
      <ChevronLeft className="size-4" aria-hidden />
      Back
    </LinkButton>
  );
}

function ChangeRow({ change }: { change: DiffChange }) {
  return (
    <li className="grid gap-2 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)] md:gap-6">
      <p className="font-medium text-ink">{change.label}</p>
      <div>
        <p className="text-xs font-medium text-ink-muted md:sr-only">Before</p>
        <p className="break-words text-ink-muted">
          {formatDiffValue(change.field, change.before, change.beforeLabel)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-muted md:sr-only">After</p>
        <p className="break-words font-medium text-ink">
          {formatDiffValue(change.field, change.after, change.afterLabel)}
        </p>
      </div>
    </li>
  );
}

function ItemGroup({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "success" | "danger" | "info";
  items: DiffItem[];
}) {
  if (items.length === 0) return null;
  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-2">
        <Badge tone={tone}>{title}</Badge>
        <span className="text-sm text-ink-muted">{items.length}</span>
      </div>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((item, index) => (
          <li key={`${describeDiffItem(item)}-${index}`} className="text-ink">
            {describeDiffItem(item)}
          </li>
        ))}
      </ul>
    </li>
  );
}

function SectionCard({ name, section }: { name: string; section: DiffSection }) {
  return (
    <section
      aria-labelledby={`section-${name}`}
      className="overflow-hidden rounded-2xl border border-line-strong"
    >
      <div className="bg-brand-50 px-5 py-4">
        <h2 id={`section-${name}`} className="font-medium text-ink">
          {sectionLabel(name)}
        </h2>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {section.changed.map((change) => (
          <ChangeRow key={change.field} change={change} />
        ))}
        <ItemGroup title="Added" tone="success" items={section.added} />
        <ItemGroup title="Removed" tone="danger" items={section.removed} />
        <ItemGroup title="Moved" tone="info" items={section.moved} />
      </ul>
    </section>
  );
}

/** A read-only look at what a revision would change, for a reviewer to check before approving. */
export function RevisionDiffPage({ revisionId }: { revisionId: string }) {
  const { data: diff, isPending, isError, error, refetch } = useRevisionDiff(revisionId);

  if (isPending) {
    return (
      <main aria-busy className={page}>
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className={page}>
        <BackButton />
        <StateMessage
          kind="error"
          title="Couldn’t load this change"
          body={error.message}
          action={<Button onClick={() => void refetch()}>Try again</Button>}
        />
      </main>
    );
  }

  const sections = changedSections(diff);

  return (
    <main className={page}>
      <BackButton />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {diff.title}
          </h1>
          <p className="mt-2 text-ink-muted">
            Submitted by {diff.submittedBy} · {diff.submittedAt}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Based on version {diff.baseVersion}</Badge>
          {diff.liveVersion !== diff.baseVersion && (
            <Badge tone="warning">Live is version {diff.liveVersion}</Badge>
          )}
        </div>
      </div>

      {diff.stale && (
        <Banner tone="warning" title="The live career has changed">
          This change was started from version {diff.baseVersion}, and the live career is now at
          version {diff.liveVersion}. Ask for a rebase before approving it.
        </Banner>
      )}

      {diff.blockers.map((notice, index) => (
        <Banner key={`blocker-${index}`} tone="danger" title={noticeText(notice)}>
          Publishing would fail until this is fixed.
        </Banner>
      ))}

      {diff.advisories.map((notice, index) => (
        <Banner key={`advisory-${index}`} tone="info" title={noticeText(notice)}>
          For your information. This doesn’t stop it being approved.
        </Banner>
      ))}

      {sections.length === 0 ? (
        <div className="rounded-3xl border border-line-strong">
          <StateMessage
            kind="empty"
            title="No changes in this revision"
            body="It matches the live career, so there is nothing to review."
          />
        </div>
      ) : (
        sections.map(({ name, section }) => (
          <SectionCard key={name} name={name} section={section} />
        ))
      )}
    </main>
  );
}
