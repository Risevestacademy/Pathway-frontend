import { describeProgress } from "../progress.utils";

type ProgressBarProps = {
  completed: number;
  total: number;
  label: string;
};

export default function ProgressBar({ completed, total, label }: ProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      aria-valuetext={describeProgress(completed, total)}
      className="h-2 overflow-hidden rounded-pill bg-grey-100"
    >
      <div
        style={{ width: `${percentage}%` }}
        className="
          h-full rounded-pill bg-brand-600
          transition-[width] duration-500 ease-out
          motion-reduce:transition-none
        "
      />
    </div>
  );
}
