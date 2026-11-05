import { Check, Info } from "lucide-react";
import checkArt from "../../../assets/images/step-complete-art.png";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import ProgressBar from "../../progress/components/ProgressBar";
import { describeProgress } from "../../progress/progress.utils";

export interface StepCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: { /** Starting at 1. */ number: number; title: string };
  /** The step's resources, and whether each was ticked. */
  resources: { id: string; title: string; ticked: boolean }[];
  /** How many steps they have completed out of how many, or null when that isn't known. */
  progress: { completed: number; total: number } | null;
  /** The step after this one, or null when this was the last. */
  nextStep: { title: string } | null;
  onNextStep: () => void;
}

/** Shown when a step has been marked complete: what they did, how far they are, and where to go next. */
export function StepCompleteDialog({
  open,
  onOpenChange,
  step,
  resources,
  progress,
  nextStep,
  onNextStep,
}: StepCompleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      centered
      title={`Step ${step.number} complete`}
      description={`${step.title}. You marked this step complete.`}
      media={
        <span className="grid size-24 place-items-center rounded-3xl bg-success-50">
          <img src={checkArt} alt="" aria-hidden draggable={false} className="max-h-14 w-auto" />
        </span>
      }
    >
      <div className="mt-6 flex flex-col gap-6 text-left">
        {resources.length > 0 && (
          <ul
            aria-label="Resources in this step"
            className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-5"
          >
            {resources.map((resource) => (
              <li key={resource.id} className="flex items-center gap-3 text-ink">
                {resource.ticked ? (
                  <>
                    <span
                      aria-hidden
                      className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-600 text-white"
                    >
                      <Check className="size-4" />
                    </span>
                    <span className="sr-only">Ticked</span>
                    <span>Resource: {resource.title}</span>
                  </>
                ) : (
                  <>
                    <span
                      aria-hidden
                      className="size-6 shrink-0 rounded-md border border-line-strong bg-surface"
                    />
                    <span>
                      Resource: {resource.title}: not ticked. You can still do it later.
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {progress && (
          <div className="flex flex-col gap-3">
            <p className="text-lg text-ink">{describeProgress(progress.completed, progress.total)}</p>
            <ProgressBar
              completed={progress.completed}
              total={progress.total}
              label="Overall progress"
            />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button isPrimary={false} size="lg" className="flex-1" onClick={() => onOpenChange(false)}>
            Stay here
          </Button>
          {nextStep && (
            <Button size="lg" className="flex-1" onClick={onNextStep}>
              Next Step: {nextStep.title}
            </Button>
          )}
        </div>

        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Info className="size-4 shrink-0" aria-hidden />
          Progress is self-reported. You can undo this any time.
        </p>
      </div>
    </Dialog>
  );
}
