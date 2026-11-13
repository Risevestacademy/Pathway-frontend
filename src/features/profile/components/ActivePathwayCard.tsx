import { Link } from "@tanstack/react-router";
import { Skeleton } from "../../../components/ui/Skeleton";
import { SkillButton } from "../../skillCheck/components/SkillButton";
import { useActivePathway } from "../hooks/useProfileData";
import { progressPercent, stepsLabel } from "../profile.utils";

const cardClass =
  "flex flex-col gap-3 rounded-[24px] border border-brand-200 bg-brand-50 p-6";
const linkClass =
  "focus-ring w-fit rounded-sm text-sm leading-5 font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800";

export function ActivePathwayCard() {
  const query = useActivePathway();

  if (query.isPending) {
    return (
      <div role="status" aria-label="Loading your active pathway" className={cardClass}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-36" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <section aria-labelledby="active-pathway-label" className={cardClass}>
        <p id="active-pathway-label" className="text-xs leading-4 font-medium text-brand-700">
          Active pathway
        </p>
        <p role="alert" className="text-sm leading-5 text-ink">
          We could not load your pathway.
        </p>
        <SkillButton isPrimary={false} className="w-fit" onClick={() => void query.refetch()}>
          Try again
        </SkillButton>
      </section>
    );
  }

  const { career, progress } = query.data;

  if (!career) {
    return (
      <section aria-labelledby="active-pathway-label" className={cardClass}>
        <p id="active-pathway-label" className="text-xs leading-4 font-medium text-brand-700">
          Active pathway
        </p>
        <p className="text-sm leading-5 text-ink">You have not started a pathway yet.</p>
        <Link to="/careers" className={linkClass}>
          Explore careers
        </Link>
      </section>
    );
  }

  const completed = progress?.completed ?? 0;
  const total = progress?.total ?? 0;

  return (
    <section aria-labelledby="active-pathway-label" className={cardClass}>
      <div className="flex flex-col gap-1">
        <p id="active-pathway-label" className="text-xs leading-4 font-medium text-brand-700">
          Active pathway
        </p>
        <h2 className="text-xl leading-7 font-medium text-ink wrap-anywhere">{career.title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Pathway progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completed}
          className="h-2 w-full overflow-hidden rounded-[2px] bg-grey-100"
        >
          <div
            style={{ width: `${progressPercent(completed, total)}%` }}
            className="h-full rounded-[2px] bg-brand-600 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          />
        </div>
        <p className="text-sm leading-5 font-medium text-grey-600">{stepsLabel(completed, total)}</p>
      </div>
      <Link to="/my-pathway/$careerId/overview" params={{ careerId: career.id }} className={linkClass}>
        Go to My Pathway
      </Link>
    </section>
  );
}