import type { ReactNode } from "react";
import { useId } from "react";
import { Badge } from "../../../components/ui/Badge";
import { analytics } from "@/lib/monitoring/events";
import { ReportIssueLink } from "../../feedback/components/ReportIssueLink";
import { REPORT_REASONS } from "../../feedback/feedback.utils";
import type { Resource } from "../../resources/resources.types";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { formatCheckedDate, type ResourceDetail } from "../resourceDetail.utils";

const KIND_LABEL: Record<Resource["kind"], string> = {
  article: "Article",
  course: "Course",
  documentation: "Docs",
  interactive: "Interactive",
  video: "Video",
  book: "Book",
  certification: "Certification",
};

const OPEN_LABEL: Record<Resource["kind"], string> = {
  article: "Open article",
  course: "Open course",
  documentation: "Open docs",
  interactive: "Open resource",
  video: "Open video",
  book: "Open book",
  certification: "Open certification",
};

const costChip = (label: string) => label.replace(/^Course: /, "").replace(/^./, (c) => c.toUpperCase());
const costTone = (label: string) =>
  /free/i.test(label) ? ("success" as const) : /paid/i.test(label) ? ("warning" as const) : ("unavailable" as const);

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="rounded-3xl border border-line bg-surface p-6">
      <h2 id={headingId} className="font-display text-xl font-medium text-ink">
        {title}
      </h2>
      <div className="mt-4 rounded-2xl border border-line p-5">{children}</div>
    </section>
  );
}

/** One resource: what it covers, how to use it, and a way to open it. */
export function ResourceDetailScreen({
  careerId,
  careerTitle,
  detail,
}: {
  careerId: string;
  careerTitle: string;
  detail: ResourceDetail;
}) {
  const { step, resource, description, curationRationale, lastChecked, skills } = detail;

  const trackOpened = () =>
    analytics.trackFeature.resourceOpened(resource.id, resource.title, resource.provider, resource.kind);

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back" />

      <header>
        <p className="text-brand-700">
          Step {step.number} · {step.title}
        </p>
        <h1 className="mt-1 font-display text-5xl font-semibold tracking-tight text-ink">
          {resource.title}
        </h1>
        <p className="mt-2 text-lg text-ink-muted">by {resource.provider}</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          {description && (
            <InfoCard title="What it covers">
              <p className="text-lg text-ink">{description}</p>
            </InfoCard>
          )}
          {skills.length > 0 && (
            <InfoCard title="Skills you'll practise">
              <ol className="flex flex-col gap-4">
                {skills.map((skill, index) => (
                  <li key={skill} className="flex items-center gap-4 text-lg text-ink">
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-sm font-medium text-brand-700"
                    >
                      {index + 1}
                    </span>
                    {skill}
                  </li>
                ))}
              </ol>
            </InfoCard>
          )}
          {curationRationale.trim() && (
            <InfoCard title="How to use it">
              <p className="text-lg text-ink">{curationRationale}</p>
            </InfoCard>
          )}
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6">
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{KIND_LABEL[resource.kind]}</Badge>
            {resource.costLabel && (
              <Badge tone={costTone(resource.costLabel)}>{costChip(resource.costLabel)}</Badge>
            )}
            {resource.certificationLabel && <Badge tone="warning">{resource.certificationLabel}</Badge>}
          </div>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackOpened}
            className="focus-ring inline-flex w-fit items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-lg font-medium text-white hover:bg-brand-600"
          >
            {OPEN_LABEL[resource.kind]}
          </a>

          <p className="text-ink-muted">
            Opens on the provider’s site. Opening it does not mark it done.
          </p>
          <p className="text-ink-muted">Last checked {formatCheckedDate(lastChecked)}</p>

          <div className="border-t border-line pt-4">
            <ReportIssueLink
              label="Report a problem with this resource"
              sentLabel="Thanks, we’ll review this resource"
              section="RESOURCES"
              reasons={REPORT_REASONS.RESOURCES}
              careerId={careerId}
              subject={resource.title}
              contextNote={`Resource: ${resource.title}, step: ${step.title}, career: ${careerTitle}`}
              note="The resource stays available while our team reviews your report."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
