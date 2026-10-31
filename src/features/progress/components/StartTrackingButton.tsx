import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Modal } from "../../../components/ui/Modal";
import { useStartTracking } from "../hooks/useProgressMutations";

type StartTrackingButtonProps = {
  careerId: string;
  careerTitle: string;
  /** The pathway this would replace, if another one is active. */
  activeCareerTitle: string | null;
  label: string;
};

export default function StartTrackingButton({
  careerId,
  careerTitle,
  activeCareerTitle,
  label,
}: StartTrackingButtonProps) {
  const mutation = useStartTracking(careerId);
  const [confirming, setConfirming] = useState(false);

  const start = () =>
    mutation.mutate(undefined, { onSuccess: () => setConfirming(false) });

  const errorMessage = (
    <p role="alert" className="text-sm text-danger-700">
      We couldn’t save this pathway. Try again.
    </p>
  );

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="w-fit"
        disabled={mutation.isPending}
        onClick={() => {
          mutation.reset();
          if (activeCareerTitle) setConfirming(true);
          else start();
        }}
      >
        {mutation.isPending && !confirming && <LoadingSpinner className="size-4" />}
        {label}
      </Button>
      {mutation.isError && !confirming && errorMessage}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Make ${careerTitle} your active pathway?`}
        description={`Your progress on ${activeCareerTitle} stays saved, and you can switch back any time.`}
        className="max-w-130"
      >
        {mutation.isError && errorMessage}
        <div className="flex gap-3">
          <Button
            isPrimary={false}
            className="flex-1"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" disabled={mutation.isPending} onClick={start}>
            {mutation.isPending && <LoadingSpinner className="size-4" />}
            {mutation.isPending ? "Switching" : "Switch pathway"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
