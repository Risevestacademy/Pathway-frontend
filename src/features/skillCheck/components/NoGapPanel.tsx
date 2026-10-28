import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { SkillButton } from "./SkillButton";

export function NoGapPanel({ busy, onStart }: { busy: boolean; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-xl leading-6 font-medium text-ink">
        You marked every skill as Have
      </h2>
      <p className="text-base leading-5 text-grey-600">
        There is no gap to start from. You can still begin at step 1 and move at your own pace.
      </p>
      <SkillButton disabled={busy} onClick={onStart}>
        Start at step 1
        <ArrowRightRegular aria-hidden className="size-5" />
      </SkillButton>
    </div>
  );
}
