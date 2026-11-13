import type { ReactNode } from "react";
import { useId } from "react";
import { Badge } from "../../../components/ui/Badge";
import { ExternalLinkButton } from "../../../components/ui/Button";
import { analytics } from "@/lib/monitoring/events";
import { ReportIssueLink } from "../../feedback/components/ReportIssueLink";
import type { Resource } from "../../resources/resources.types";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useResourceTicks } from "../hooks/useResourceTicks";
import { formatCheckedDate, type ResourceDetail } from "../resourceDetail.utils";
import { KIND_LABEL, costChip, costTone } from "../resourceLabels";

const OPEN_LABEL: Record<Resource["kind"], string> = {
  article: "Open article",
  course: "Open course",
  documentation: "Open docs",
  interactive: "Open resource",
  video: "Open video",
  book: "Open book",
  certification: "Open certification",
};

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
  const { isTicked, isUnsaved, toggle } = useResourceTicks(careerId);

  const trackOpened = () =>
    analytics.trackFeature.resourceOpened(resource.id, resource.title, resource.provider, resource.kind);

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back" />

      <header>
        <p className="text-brand-700">
          Step {step.number} · {step.title}
        </p>
        <h1 className="mt-1 font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
          {resource.title}
        </h1>
        <p className="mt-2 text-base text-ink-muted">by {resource.provider}</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          {description && (
            <InfoCard title="What it covers">
              <p className="text-base text-ink">{description}</p>
            </InfoCard>
          )}
          {skills.length > 0 && (
            <InfoCard title="Skills you'll practise">
              <ol className="flex flex-col gap-4">
                {skills.map((skill, index) => (
                  <li key={skill} className="flex items-center gap-4 text-base text-ink">
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
              <p className="text-base text-ink">{curationRationale}</p>
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

          <ExternalLinkButton
            href={resource.url}
            size="lg"
            onClick={trackOpened}
            className="w-fit"
          >
            {OPEN_LABEL[resource.kind]}
          </ExternalLinkButton>

          <p className="text-sm text-ink-muted">
            Opens on the provider’s site. Opening it does not mark it done.
          </p>
          <p className="text-sm text-ink-muted">Last checked {formatCheckedDate(lastChecked)}</p>

          <label className="flex cursor-pointer items-start gap-3 border-t border-line pt-4">
            <input
              type="checkbox"
              checked={isTicked(resource.id)}
              onChange={() => toggle(resource.id)}
              className="focus-ring mt-0.5 size-6 shrink-0 cursor-pointer rounded-md border border-line-strong accent-brand-600"
            />
            <span className="flex flex-col">
              <span className="text-base font-medium text-ink">I have done this resource</span>
              <span className="text-sm text-ink-muted">Your own tick. Only you see it.</span>
            </span>
            {isUnsaved(resource.id) && <Badge tone="warning">Not saved</Badge>}
          </label>

          <div className="border-t border-line pt-4">
            <ReportIssueLink
              subject={resource.title}
              section="RESOURCES"
              careerId={careerId}
              about={`${careerTitle} · ${step.title} · ${resource.title}`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
