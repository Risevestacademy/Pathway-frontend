import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { EmailAlreadyRegisteredError } from "../../../lib/api/auth.api";
import AuthLayout from "./AuthLayout";
import AuthGoogleButton from "./AuthGoogleButton";

interface SignupValues {
  fullName: string;
  email: string;
  password: string;
}

export default function SignupForm({
  onSubmit,
  onGoogleAuth,
}: {
  onSubmit: (values: SignupValues) => Promise<void>;
  onGoogleAuth: (idToken: string) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setEmailTaken(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await onSubmit({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
    } catch (error) {
      setEmailTaken(error instanceof EmailAlreadyRegisteredError);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="signup">
      <form
        className="space-y-3"
        onSubmit={handleSubmit}
        aria-labelledby="signup-heading"
      >
        <h1
          id="signup-heading"
          className="mb-8 text-center font-display text-xl font-semibold text-ink"
        >
          Create an account
        </h1>
        <label htmlFor="fullName" className="sr-only">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Full name"
          className="auth-input"
          autoComplete="name"
        />
        <label htmlFor="signup-email" className="sr-only">
          Email address
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="auth-input"
          autoComplete="email"
        />
        <div className="relative">
          <label htmlFor="signup-password" className="sr-only">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Password"
            className="auth-input pr-11"
            autoComplete="new-password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="focus-ring absolute inset-y-0 right-1 flex min-w-11 items-center justify-center rounded-lg text-grey-500"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
            {emailTaken && (
              <>
                {" "}
                <Link to="/login" className="font-semibold underline">
                  Log in instead
                </Link>
              </>
            )}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-grey-500">
        <span className="h-px flex-1 bg-grey-200" />
        OR
        <span className="h-px flex-1 bg-grey-200" />
      </div>
      <AuthGoogleButton onAuthenticate={onGoogleAuth} />
      <p className="mt-5 text-center text-xs text-grey-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-5 text-center text-[11px] leading-4 text-grey-500">
        By creating an account, you agree to our{" "}
        <span className="font-semibold text-ink">
          Terms and Privacy Policy.
        </span>
      </p>
    </AuthLayout>
  );
}
