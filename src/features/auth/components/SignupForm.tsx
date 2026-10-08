import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import AuthLayout from "./AuthLayout";
import AuthSocialButtons from "./AuthSocialButtons";

interface SignupValues {
  email: string;
  password: string;
}

export default function SignupForm({
  onSubmit,
}: {
  onSubmit: (values: SignupValues) => Promise<void>;
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
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
    } catch (error) {
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
      <form className="space-y-3" onSubmit={handleSubmit} noValidate={false}>
        <h1 className="mb-8 text-center font-display text-xl font-semibold text-ink">Create an account</h1>
        <input name="name" type="text" required placeholder="Full name" className="auth-input" autoComplete="name" />
        <input name="email" type="email" required placeholder="Email address" className="auth-input" autoComplete="email" />
        <div className="relative">
          <input name="password" type={showPassword ? "text" : "password"} required minLength={8} placeholder="Password" className="auth-input pr-11" autoComplete="new-password" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 flex items-center text-grey-400">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <AuthSocialButtons />
      <p className="mt-5 text-center text-xs text-grey-500">Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
      <p className="mt-5 text-center text-[11px] leading-4 text-grey-500">By signing in to Pathway, you agree to our <span className="font-semibold text-ink">Terms and Privacy Policy.</span></p>
    </AuthLayout>
  );
}