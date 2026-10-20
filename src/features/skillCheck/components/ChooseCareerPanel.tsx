import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/Button";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { CareerPicker } from "./CareerPicker";
import { InfoNote } from "./InfoNote";

export function ChooseCareerPanel({
  careers,
  value,
  onChange,
  onStart,
}: {
  careers: SkillCheckCareerSummary[];
  value: string | null;
  onChange: (careerId: string) => void;
  onStart: () => void;
}) {
  return (
    <section
      aria-labelledby="choose-career-title"
      className="flex min-w-0 flex-col gap-4 rounded-3xl border border-grey-100 bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="choose-career-title"
          className="font-display text-xl leading-6 font-medium text-ink"
        >
          Choose a career to explore.
        </h2>
        <p className="text-sm leading-5 text-grey-600">
          No pathway started yet. Exploring a career won&rsquo;t enrol you.
        </p>
      </div>
      <CareerPicker careers={careers} value={value} onChange={onChange} name="career-to-explore" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" disabled={!value} onClick={onStart}>
          Start skill check
          <ArrowRightRegular aria-hidden className="size-5" />
        </Button>
        <Link
          to="/careers"
          className="focus-ring inline-flex flex-1 items-center justify-center rounded-[16px] border border-b-4 border-grey-100 bg-surface px-4 py-3 text-base leading-5 font-semibold text-grey-600 transition-colors hover:bg-grey-50 motion-reduce:transition-none"
        >
          Explore careers
        </Link>
      </div>
      <InfoNote>
        This is based on what you tell us, not a test. It takes about 5 minutes and you
        can stop and resume.
      </InfoNote>
    </section>
  );
}
