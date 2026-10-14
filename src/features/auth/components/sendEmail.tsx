import keyIcon from "@/assets/icons/key-icon.svg";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { validateEmail } from "@/lib/validation/auth.schema";
import { useState } from "react";
import { cn } from "cn";
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
      onError: () => {
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
      <img alt="" src={keyIcon} />
      <div className="flex flex-col gap-2 pt-4 pb-7">
        <h1 className="text-heading">Reset Password</h1>
        <p className="text-body-md text-grey-500">
          A confirmation email would be sent to your email
        </p>
      </div>

      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 pb-6"
        >
          <div className="flex flex-col w-full">
            <input
              type="email"
              name="email"
              aria-label="Email address"
              placeholder="Email address"
              onChange={handleChange}
              value={email}
              autoComplete="email"
              className={cn(
                "px-3.5 py-2 border border-grey-50 rounded-lg text-body-md placeholder:text-ink-muted focus:outline-none focus:border-brand-600",
                error && "border-danger-600",
              )}
            />
            {error && (
              <p role="alert" className="text-danger-600 text-sm text-left">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full flex gap-2 items-center justify-center"
            disabled={isPending}
          >
            <span>Send email</span>
            {isPending && (
              <LoadingSpinner className="ml-2 h-5 w-5 text-white" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
