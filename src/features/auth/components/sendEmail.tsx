import keyIcon from "@/assets/icons/key-icon.svg";
import { Button } from "@/components/ui/Button";
import { validateEmail } from "@/lib/validation/auth.schema";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useResetPassword } from "../hooks/useResetPassword";

export default function SendEmailComponent({
  setisEmailSent,
  setEmail,
  email,
}: {
  setisEmailSent: (isEmailSent: boolean) => void;
  setEmail: (email: string) => void;
  email: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const resetPasswordHandler = () => {
    const error = validateEmail(email);
    if (error) {
      setError(error);
      return;
    }

    resetPassword(email, {
      onError: (error) => {
        console.error("Error sending password reset email:", error);
        setError("Failed to send password reset email. Please try again.");
      },
      onSuccess: () => {
        setError(null);
        setEmail(email);
        setisEmailSent(true);
      },
    });
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetPasswordHandler();
  };

  return (
    <div className="w-93.75 flex flex-col items-center text-center font-display animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none">
      <img src={keyIcon} />
      <div className="flex flex-col gap-2 pt-4 pb-7">
        <h1 className="text-heading">Reset Password</h1>
        <p className="text-body-md text-grey-500">
          A confirmation email would be sent to your email
        </p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-6">
          <div className="flex flex-col w-full">
            <input
              type="text"
              name="email"
              placeholder="Email address"
              onChange={handleChange}
              value={email}
              className={cn(
                "px-3.5 py-2 border border-grey-50 rounded-lg text-body-md placeholder:text-grey-400 focus:outline-none focus:border-brand-600",
                error && "border-red-500",
              )}
            />
            {error && <p className="text-red-500 text-sm text-left">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full flex gap-2 items-center justify-center"
            disabled={isPending}
          >
            <span>Send email</span>
            {isPending && (
              <svg
                className="animate-spin h-5 w-5 text-white ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </Button>
        </form>

        <p className="text-body-md text-grey-500">
          Haven't received a code?{" "}
          <a
            href=""
            className="font-semibold text-brand-600 hover:text-brand-700"
            onClick={(e) => {
              e.preventDefault();
              resetPasswordHandler();
            }}
          >
            Resend code
          </a>
        </p>
      </div>
    </div>
  );
}
