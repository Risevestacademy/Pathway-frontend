import { CircleCheck, Route } from "lucide-react";
import Section from "./section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Career } from "@/features/careerDetail/careerDetail.types";
import StatGroup from "./statGroup";
import { useNavigate } from "@tanstack/react-router";

export default function Detail({ career }: { career: Career }) {
  const navigate = useNavigate();
  const salary = career.stats.filter(
    (s) => s.kind === "salary-median" || s.kind === "salary-range",
  );
  const outlook = career.stats.filter(
    (s) => s.kind === "employment-projection" || s.kind === "demand",
  );

  return (
    <article>
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {career.title}
      </h1>
      <p className="mt-2 text-lg text-ink-muted">{career.description}</p>

      {/* 1. Role summary */}
      <Section n={1} title="What the role involves">
        <p className="leading-relaxed text-ink">{career.roleSummary}</p>
      </Section>

      {/* 2. Example work activities */}
      <Section n={2} title="Example work activities">
        <ul className="grid gap-2">
          {career.workActivities.map((a) => (
            <li key={a} className="flex gap-3">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Entry considerations */}
      <Section n={3} title="How people get into it">
        <dl className="grid gap-3">
          {career.entryConsiderations.map((e) => (
            <Card key={e.label} className="p-4">
              <dt className="text-sm font-semibold">{e.label}</dt>
              <dd className="mt-1 text-sm text-ink-muted">{e.detail}</dd>
            </Card>
          ))}
        </dl>
      </Section>

      {/* 4. Linked roadmap */}
      <Section n={4} title="Roadmap">
        <Card className="flex flex-col gap-4 bg-brand-50/50 p-5 sm:flex-row sm:items-center">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-brand-600 text-ink-inverse">
            <Route className="size-6" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {career.roadmapId
                ? `Step-by-step roadmap to become a ${career.title}`
                : "Roadmap coming soon"}
            </p>
            <p className="text-sm text-ink-muted">
              {career.roadmapId
                ? "Recommended learning steps with curated resources. Go at your own pace."
                : "We’re still putting together a learning roadmap for this career."}
            </p>
          </div>
          {career.roadmapId && (
            <Button
              onClick={() => navigate({ to: `/careers/${career.id}/roadmap` })}
            >
              View roadmap
            </Button>
          )}
        </Card>
      </Section>

      {/* 5. Salary & outlook — pay and projections are separate; geographies never blended */}
      <Section n={5} title="Pay and job outlook">
        {career.stats.length === 0 ? (
          <Card className="p-5 text-sm text-ink-muted">
            Pay and outlook data is unavailable for this career.
          </Card>
        ) : (
          <div className="grid gap-8">
            <StatGroup title="Pay" stats={salary} />
            <StatGroup title="Job outlook" stats={outlook} />
          </div>
        )}
      </Section>
    </article>
  );
}
