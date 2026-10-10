import celebrateIcon from "@/assets/icons/celebrate.svg";
import { LinkButton } from "@/components/ui/Button";

export default function PasswordChanged() {
  return (
    <div className="w-93.75 flex flex-col items-center text-center font-display animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none">
      <img src={celebrateIcon} />
      <div className="flex flex-col gap-2 pt-4 pb-7">
        <h1 className="text-heading">Password Reset!</h1>
        <p className="text-body-md text-grey-500">
          Your password has now been reset successfully
        </p>
      </div>

      <LinkButton to="/" className="w-full">
        Continue
      </LinkButton>
    </div>
  );
}
