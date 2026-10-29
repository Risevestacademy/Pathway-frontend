import { Check, TriangleAlert } from "lucide-react";
import clsx from "clsx";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { getPublishIssues, type AdminCareerRow } from "../admin.utils";
import { useAdminStore } from "../adminStore";
import { useDeleteCareer } from "../hooks/useDeleteCareer";

interface StatusDialogProps {
  career: AdminCareerRow | null;
  onClose: () => void;
}

function Actions({
  confirmLabel,
  disabled,
  danger,
  onConfirm,
  onClose,
}: {
  confirmLabel: string;
  disabled?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-6 flex gap-3">
      <Button
        className={danger ? "!border-danger-700 !bg-danger-600" : undefined}
        disabled={disabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
      <Button isPrimary={false} onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}

export function PublishCareerDialog({ career, onClose }: StatusDialogProps) {
  const setStatus = useAdminStore((s) => s.setStatus);
  const issues = career ? getPublishIssues(career) : [];
  const passed = issues.length === 0;

  return (
    <Dialog
      open={career !== null}
      onOpenChange={(open) => !open && onClose()}
      title={`Publish ${career?.title ?? ""}?`}
      description="Learners will see this career in Explore straight away. You can unpublish or retire it later; saved learner progress is kept."
    >
      {career && (
        <>
          <div
            className={clsx(
              "mt-5 flex gap-3 rounded-2xl p-4",
              passed ? "bg-success-50" : "bg-warning-50",
            )}
          >
            <span
              aria-hidden
              className={clsx(
                "grid size-8 shrink-0 place-items-center rounded-lg text-white",
                passed ? "bg-success-600" : "bg-warning-600",
              )}
            >
              {passed ? <Check className="size-5" /> : <TriangleAlert className="size-5" />}
            </span>
            <div>
              <p className="font-medium text-ink">
                {passed ? "Checks passed" : "Fix these before publishing"}
              </p>
              {passed ? (
                <p className="mt-1 text-ink">
                  Summary, salary source, outlook source and {career.stepCount} topics are
                  all complete.
                </p>
              ) : (
                <ul className="mt-1 list-disc pl-5 text-ink">
                  {issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <Actions
            confirmLabel="Publish career"
            disabled={!passed}
            onConfirm={() => {
              setStatus(career.id, "published");
              onClose();
            }}
            onClose={onClose}
          />
        </>
      )}
    </Dialog>
  );
}

export function RetireCareerDialog({ career, onClose }: StatusDialogProps) {
  const setStatus = useAdminStore((s) => s.setStatus);

  return (
    <Dialog
      open={career !== null}
      onOpenChange={(open) => !open && onClose()}
      title={`Retire ${career?.title ?? ""}?`}
      description="Learners will no longer see this career in Explore. Saved learner progress is kept."
    >
      {career && (
        <Actions
          confirmLabel="Retire career"
          danger
          onConfirm={() => {
            setStatus(career.id, "retired");
            onClose();
          }}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

export function DeleteCareerDialog({
  career,
  onClose,
  onDeleted,
}: StatusDialogProps & { onDeleted?: (career: AdminCareerRow) => void }) {
  const remove = useDeleteCareer();

  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Dialog
      open={career !== null}
      onOpenChange={(open) => !open && close()}
      title={`Delete ${career?.title ?? ""}?`}
      description="This permanently deletes the draft with its roadmap, skills, outlook and revisions. It can’t be undone. Only a draft that was never published and hasn’t been saved by anyone can be deleted."
    >
      {career && (
        <>
          {remove.isError && (
            <p role="alert" className="mt-4 text-sm text-danger-700">
              {remove.error.message}
            </p>
          )}
          <Actions
            confirmLabel={remove.isPending ? "Deleting..." : "Delete career"}
            danger
            disabled={remove.isPending}
            onConfirm={() =>
              remove.mutate(career, {
                onSuccess: () => {
                  onDeleted?.(career);
                  close();
                },
              })
            }
            onClose={close}
          />
        </>
      )}
    </Dialog>
  );
}
