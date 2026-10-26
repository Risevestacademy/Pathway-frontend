import { HOW_IT_WORKS_STEPS } from "../skillCheck.copy";
import { InfoNote } from "./InfoNote";
import { StepNumberList } from "./StepNumberList";

export function HowItWorksCard() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="flex min-w-0 flex-col gap-4 rounded-3xl border border-grey-100 bg-surface p-5 sm:p-6"
    >
      <h2
        id="how-it-works-title"
        className="font-display text-xl leading-6 font-medium text-ink"
      >
        How it works
      </h2>
      <StepNumberList steps={HOW_IT_WORKS_STEPS} />
      <InfoNote>
        Exploring a career won&rsquo;t enrol you. Add it to your pathway when ready.
      </InfoNote>
    </section>
  );
}
