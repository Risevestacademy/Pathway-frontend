import keyIcon from "@/assets/icons/key-icon.svg";
import { Button } from "@/components/ui/Button";

export default function SendEmailComponent({
  setisEmailSent,
}: {
  setisEmailSent: (isEmailSent: boolean) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return (
    <div className="w-93.75 flex flex-col items-center text-center font-display">
      <img src={keyIcon} />
      <div className="flex flex-col gap-2 pt-4 pb-7">
        <h1 className="text-heading">Reset Password</h1>
        <p className="text-body-md text-grey-500">
          A confirmation email would be sent to your email
        </p>
      </div>

      <div className="w-full">
        <form className="flex flex-col gap-6 pb-6">
          <input
            type="text"
            name="email"
            placeholder="Email address"
            onChange={handleChange}
            className="px-3.5 py-2 border border-grey-50 rounded-lg text-body-md placeholder:text-grey-400 focus:outline-none focus:border-brand-600"
          />
          <Button
            type="submit"
            className="w-full"
            onClick={() => setisEmailSent(true)}
          >
            Send email
          </Button>
        </form>
        <p className="text-body-md text-grey-500">
          Haven't received a code?{" "}
          <a
            href="#"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Resend code
          </a>
        </p>
      </div>
    </div>
  );
}
