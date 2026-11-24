import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { SkillLink } from "./SkillButton";

/** No skill was marked Not yet, so there is no later step to start from. */
export function NoGapPanel({ careerId }: { careerId: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-xl leading-6 font-medium text-ink">
        No gaps to start from
      </h2>
      <p className="text-base leading-5 text-grey-600">
        You didn&rsquo;t mark any skill as Not yet. Begin at step 1 and move at your own pace.
      </p>
      <SkillLink to="/my-pathway/$careerId/overview" params={{ careerId }}>
        Go to roadmap
        <ArrowRightRegular aria-hidden className="size-5" />
      </SkillLink>
    </div>
  );
}
