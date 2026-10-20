import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import AuthLayout from "./AuthLayout";
import AuthGoogleButton from "./AuthGoogleButton";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginForm({
  onSubmit,
  onGoogleAuth,
}: {
  onSubmit: (values: LoginValues) => Promise<void>;
  onGoogleAuth: (idToken: string) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await onSubmit({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't log you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <form className="space-y-3" onSubmit={handleSubmit} aria-labelledby="login-heading">
        <h1 id="login-heading" className="mb-8 text-center font-display text-xl font-semibold text-ink">Log in</h1>
        <label htmlFor="login-email" className="sr-only">Email address</label>
        <input id="login-email" name="email" type="email" required placeholder="Email address" className="auth-input" autoComplete="email" />
        <div className="relative">
          <label htmlFor="login-password" className="sr-only">Password</label>
          <input id="login-password" name="password" type={showPassword ? "text" : "password"} required placeholder="Password" className="auth-input pr-11" autoComplete="current-password" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="focus-ring absolute inset-y-0 right-1 flex min-w-11 items-center justify-center rounded-lg text-grey-500">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        <Link to="/reset-password" className="inline-block text-xs font-semibold text-brand-600 hover:underline">Forgot Password?</Link>
        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-grey-500">
        <span className="h-px flex-1 bg-grey-200" />
        OR
        <span className="h-px flex-1 bg-grey-200" />
      </div>
      <AuthGoogleButton onAuthenticate={onGoogleAuth} />
      <p className="mt-5 text-center text-xs text-grey-500">Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create one</Link>
      </p>
      <p className="mt-5 text-center text-[11px] leading-4 text-grey-500">By signing in to Pathway, you agree to our <span className="font-semibold text-ink">Terms and Privacy Policy.</span></p>
    </AuthLayout>
  );
}