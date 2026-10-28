import { pluralise } from "../skillCheck.copy";
import type { SkillCounts } from "../skillCheck.types";
import { Tag } from "./Tag";
import type { TagTone } from "./Tag";

export function ResultCounts({ counts }: { counts: SkillCounts }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <CountCard
        tone="success"
        tag="Have"
        value={counts.have}
        label={`${pluralise(counts.have, "skill", "skills")} you can do today`}
      />
      <CountCard
        tone="warning"
        tag="Not yet"
        value={counts.notYet}
        label={`${pluralise(counts.notYet, "skill", "skills")} you are still learning`}
      />
      <CountCard
        tone="neutral"
        tag="Not sure"
        value={counts.notSure}
        label={`${pluralise(counts.notSure, "skill", "skills")} to check again`}
      />
    </div>
  );
}

function CountCard({
  tone,
  tag,
  value,
  label,
}: {
  tone: TagTone;
  tag: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-[20px] border border-grey-100 bg-surface p-5">
      <Tag tone={tone}>{tag}</Tag>
      <p className="text-4xl leading-10 font-medium text-ink tabular-nums">{value}</p>
      <p className="text-sm leading-5 text-grey-600">{label}</p>
    </div>
  );
}
