import celebrateIcon from "@/assets/icons/celebrate.svg";
import { Button } from "@/components/ui/Button";

export default function PasswordChanged({
  setisPasswordChanged,
}: {
  setisPasswordChanged: (changed: boolean) => void;
}) {
  return (
    <div className="w-93.75 flex flex-col items-center text-center font-display">
      <img src={celebrateIcon} />
      <div className="flex flex-col gap-2 pt-4 pb-7">
        <h1 className="text-heading">Password Reset!</h1>
        <p className="text-body-md text-grey-500">
          Your password has now been reset successfully
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        onClick={() => setisPasswordChanged(true)}
      >
        Continue
      </Button>
    </div>
  );
}
