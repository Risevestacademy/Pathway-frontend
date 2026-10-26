import { useState } from "react";

/**
 * For people who signed up but never verified. Reads the email typed into the
 * surrounding form, so it works whether or not the form was submitted.
 */
export default function ResendCodeLink({
  getEmail,
  onResend,
}: {
  getEmail: () => string;
  onResend: (email: string) => Promise<void>;
}) {
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    const email = getEmail().trim();
    if (!email) {
      setError("Enter your email address above first.");
      return;
    }
    setError(null);
    setIsResending(true);
    try {
      await onResend(email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't resend the code. Please try again.",
      );
      setIsResending(false);
    }
  };

  return (
    <span className="inline text-xs">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isResending}
        className="focus-ring font-semibold text-brand-600 underline disabled:opacity-60"
      >
        {isResending ? "Sending code..." : "Resend code"}
      </button>
      {error && (
        <span role="alert" className="mt-1 block text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
