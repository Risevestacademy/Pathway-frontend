import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import { useId } from "react";
import { Link } from "@tanstack/react-router";
import { LinkButton } from "../../../components/ui/Button";
import type {
  DashboardCurrentProjectDto,
  DashboardProjectStepDto,
} from "../../../lib/api/dashboard.api";
import ProgressBar from "../../progress/components/ProgressBar";

const STATUS_LABEL: Record<DashboardProjectStepDto["status"], string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

/** The stage the person is working through, or a way to start one. */
export function CurrentProjectsCard({ project }: { project: DashboardCurrentProjectDto | null }) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2"
    >
      <h2 id={headingId} className="px-4 pt-3 text-base font-medium text-ink-muted">
        Current Projects
      </h2>
      {project ? <ProjectBody project={project} /> : <EmptyBody />}
    </section>
  );
}

function ProjectBody({ project }: { project: DashboardCurrentProjectDto }) {
  const steps = [...project.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-grey-50 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-medium text-ink">{project.stageTitle}</h3>
        <p className="text-sm text-ink-muted">{project.stageDescription}</p>
      </div>

      <ProgressBar completed={project.completed} total={project.total} label="Project progress" />

      {project.skills.length > 0 && (
        <ul aria-label="Skills" className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <li key={skill} className="rounded-pill bg-brand-50 px-3 py-1 text-sm text-brand-ink">
              {skill}
            </li>
          ))}
        </ul>
      )}

      <ul aria-label="Steps" className="flex flex-col gap-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-base"
          >
            <span
              aria-hidden
              className={clsx(
                "grid size-6 shrink-0 place-items-center rounded-full border",
                step.status === "COMPLETED" && "border-brand-500 bg-brand-500 text-white",
                step.status === "IN_PROGRESS" && "border-brand-500 bg-brand-100",
                step.status === "NOT_STARTED" && "border-grey-200 bg-surface",
              )}
            >
              {step.status === "COMPLETED" && <Check className="size-4" />}
            </span>
            <span className="sr-only">{STATUS_LABEL[step.status]}: </span>
            <span className={clsx(step.status === "COMPLETED" ? "text-ink-subtle line-through" : "text-ink")}>
              {step.title}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to="/my-pathway"
        className="focus-ring inline-flex w-fit items-center gap-1.5 rounded text-base font-medium text-brand-600"
      >
        Continue your pathway
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

function EmptyBody() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl bg-grey-50 px-6 py-10 text-center">
      <h3 className="font-display text-xl font-medium text-ink">No projects yet</h3>
      <p className="max-w-md text-sm text-ink-muted">
        Projects show up when you start a pathway. Each one is a small build you can do on your
        own, with a brief to follow.
      </p>
      <LinkButton to="/careers" isPrimary={false}>
        Explore careers
      </LinkButton>
    </div>
  );
}
