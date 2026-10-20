import { Button } from "../../../components/ui/Button";
import { TrackIcon } from "../../../components/TrackIcon";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { ReviewTag } from "./Tag";

export function OtherCareersCard({
  careers,
  onSelect,
  onChooseAnother,
}: {
  careers: SkillCheckCareerSummary[];
  onSelect: (career: SkillCheckCareerSummary) => void;
  onChooseAnother: () => void;
}) {
  return (
    <section
      aria-labelledby="other-careers-title"
      className="flex min-w-0 flex-col gap-4 rounded-3xl border border-grey-100 bg-surface p-5 sm:p-6"
    >
      <h2
        id="other-careers-title"
        className="font-display text-xl leading-6 font-medium text-ink"
      >
        Check a different career
      </h2>
      <ul className="flex flex-col gap-3">
        {careers.map((career) => (
          <li key={career.careerId}>
            <button
              type="button"
              onClick={() => onSelect(career)}
              className="focus-ring flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-grey-100 bg-surface p-2 text-left transition-colors hover:bg-grey-50 motion-reduce:transition-none"
            >
              <span className="flex min-w-0 items-center gap-2">
                <TrackIcon icon={career.icon} size={32} />
                <span className="min-w-0 text-base leading-5 font-medium text-ink">
                  {career.name}
                </span>
              </span>
              <ReviewTag reviewed={career.reviewed} />
            </button>
          </li>
        ))}
      </ul>
      <Button isPrimary={false} size="lg" onClick={onChooseAnother}>
        Choose another career
      </Button>
    </section>
  );
}
