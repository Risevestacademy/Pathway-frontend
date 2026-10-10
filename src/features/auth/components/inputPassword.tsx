import inputIcon from "@/assets/icons/input-icon.svg";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { PasswordResetError } from "@/lib/api/auth.api";
import { useConfirmResetPassword } from "../hooks/useResetPassword";

export default function InputPassword({
  setisPasswordChanged,
  token = "",
}: {
  setisPasswordChanged: (changed: boolean) => void;
  token: string | undefined;
}) {
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string[]>([]);

  const { mutate: confirmResetPassword, isPending } = useConfirmResetPassword();

  const handleChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPassword = e.target.value;
    setPassword1(nextPassword);
    if (password2 && nextPassword !== password2) {
      setError(["Passwords do not match"]);
    } else {
      setError([]);
    }
  };

  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextConfirmation = e.target.value;
    setPassword2(nextConfirmation);
    if (password1 && password1 !== nextConfirmation) {
      setError(["Passwords do not match"]);
    } else {
      setError([]);
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password1 || !password2) {
      setError(["Please enter and confirm your password"]);
      return;
    }

    if (password1 !== password2) {
      setError(["Passwords do not match"]);
      return;
    }

    setError([]);
    confirmResetPassword(
      { newPassword: password1, token },
      {
        onError: (error) => {
          setError(
            error instanceof PasswordResetError
              ? error.messages
              : ["Failed to reset password"],
          );
        },
        onSuccess: () => {
          setisPasswordChanged(true);
        },
      },
    );
  };

  return (
    <div className="w-93.75 flex flex-col items-center text-center font-display animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none">
      <img src={inputIcon} />
      <div className="flex flex-col gap-2 pt-4 pb-7">
        <h1 className="text-heading">Reset Password</h1>
        <p className="text-body-md text-grey-500">
          Your new password must be different from your old password
        </p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange1}
              className="w-full px-3.5 py-2 pr-11 border border-grey-50 rounded-lg text-body-md placeholder:text-grey-400 focus:outline-none focus:border-brand-600"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
            >
              {showPassword ? (
                <EyeOff size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="flex flex-col w-full">
            <div className="relative">
              <input
                type={showConfirmation ? "text" : "password"}
                name="confirm-password"
                placeholder="Confirm password"
                onChange={handleChange2}
                className="w-full px-3.5 py-2 pr-11 border border-grey-50 rounded-lg text-body-md placeholder:text-grey-400 focus:outline-none focus:border-brand-600"
              />
              <button
                type="button"
                aria-label={
                  showConfirmation
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
                aria-pressed={showConfirmation}
                onClick={() => setShowConfirmation((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
              >
                {showConfirmation ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
            {error.length > 0 && (
              <ul className="text-red-500 text-sm text-left">
                {error.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="submit"
            className="w-full flex gap-2 items-center justify-center"
            disabled={isPending}
          >
            <span>Reset password</span>
            {isPending && (
              <svg
                className="animate-spin ml-2 h-5 w-5 text-white"
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
        {/* <p className="text-body-md text-grey-500">
          Haven't received a code?{" "}
          <a
            href="#"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Resend code
          </a>
        </p> */}
      </div>
    </div>
  );
}
