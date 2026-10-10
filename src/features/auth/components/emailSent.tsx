import mailBox from "@/assets/icons/mail-box.svg";
import { Button } from "@/components/ui/Button";
import repeatIcon from "@/assets/icons/repeat-icon.svg";
import arrowsLeft from "@/assets/icons/arrows-left.svg";

export default function EmailSentComponent({
  setIsEmailSent,
  setEmail,
  email,
}: {
  setIsEmailSent: (isEmailSent: boolean) => void;
  setEmail: (email: string) => void;
  email: string;
}) {
  return (
    <div className="w-93.75 flex flex-col gap-6 items-center text-center font-display animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none">
      <div className="flex flex-col gap-4 items-center">
        <img src={mailBox} />
        <h1 className="text-heading">Check your email!</h1>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <p className="text-body-md text-grey-500">We sent an email to</p>
        <p className="text-body-lg text-2xl text-grey-900 underline decoration-dotted decoration-grey-300 underline-offset-[11%]">
          {email.toLowerCase()}{" "}
        </p>
        <a
          href=""
          className="flex gap-0.5 items-center text-brand-600 hover:text-brand-700"
          onClick={(e) => {
            e.preventDefault();
            setEmail("");
            setIsEmailSent(false);
          }}
        >
          <img src={repeatIcon} />
          <span>Change email address</span>
        </a>
      </div>
      <Button
        type="button"
        className="w-full flex gap-2 items-center justify-center"
        onClick={() => setIsEmailSent(false)}
        isPrimary={false}
      >
        <img src={arrowsLeft} />
        <span>Go back</span>
      </Button>
    </div>
  );
}
