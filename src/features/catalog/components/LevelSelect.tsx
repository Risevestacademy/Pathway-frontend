import { BriefcaseBusiness, Check, GraduationCap, School } from "lucide-react";
import clsx from "clsx";
import { Button } from "../../../components/ui/Button";
import { CAREER_LEVELS, type CareerLevel } from "../catalog.types";
import { useSession } from "../../../lib/stores/session";

const icons: Record<CareerLevel, typeof School> = {
  "university-student": School,
  "recent-graduate": GraduationCap,
  "early-career": BriefcaseBusiness,
};

interface LevelSelectProps {
  onContinue: () => void;
}

export default function LevelSelect({ onContinue }: LevelSelectProps) {
  const { level, setLevel } = useSession();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <p className="mb-2 text-sm font-medium text-brand-700">Step 1 of 2</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
        Where are you in your career?
      </h1>
      <p className="mt-2 text-ink-muted">
        We'll put the most relevant careers first. You can change this any time.
      </p>

      <div className="grid gap-3 mt-6">
        {CAREER_LEVELS.map((l) => {
          const Icon = icons[l.id];
          const active = level === l.id;
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={active}
              onClick={() => setLevel(l.id)}
              className={clsx(
                "flex items-center gap-4 rounded-lg border bg-surface p-4 text-left cursor-pointer",
                "transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                active ? "border-brand-600 ring-2 ring-brand-100" : "border-line hover:border-brand-300"
              )}
            >
              <span
                className={clsx(
                  "grid size-11 shrink-0 place-items-center rounded-md",
                  active ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-medium">{l.label}</span>
                <span className="block text-sm text-ink-muted">{l.blurb}</span>
              </span>
              <span
                className={clsx(
                  "grid size-5 place-items-center rounded-full border",
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-grey-200"
                )}
                aria-hidden="true"
              >
                {active && <Check className="size-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        isPrimary
        size="lg"
        disabled={!level}
        onClick={onContinue}
        className="mt-8 w-full"
      >
        Continue
      </Button>
      <p className="mt-4 text-center text-xs text-ink-subtle">
        No account needed. Your answers are kept only for this browsing session.
      </p>
    </main>
  );
}