import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "cn";
import { useResendCooldown } from "@/features/auth/hooks/useResendCooldown";
import { useAuthStore } from "@/lib/stores/authStore";
import { clearPendingEmailChange } from "../pendingEmailChange";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const CODE_LENGTH = 6;

export default function VerifyEmailChange({
  onClose,
}: {
  onClose: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { remaining, start } = useResendCooldown();
  const userId = useAuthStore((state) => state.user?.id);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH;

  const focusAt = (idx: number) =>
    inputs.current[Math.min(Math.max(idx, 0), CODE_LENGTH - 1)]?.focus();

  const handleChange = (idx: number, value: string) => {
    const entered = value.replace(/\D/g, "");
    if (!entered) {
      setDigits((current) => current.map((d, i) => (i === idx ? "" : d)));
      return;
    }

    setDigits((current) => {
      const next = [...current];
      entered
        .slice(0, CODE_LENGTH - idx)
        .split("")
        .forEach((digit, offset) => {
          next[idx + offset] = digit;
        });
      return next;
    });
    focusAt(idx + entered.length);
  };

  const handleKeyDown = (idx: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !digits[idx]) {
      focusAt(idx - 1);
    } else if (event.key === "ArrowLeft") {
      focusAt(idx - 1);
    } else if (event.key === "ArrowRight") {
      focusAt(idx + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ""));
    focusAt(pasted.length);
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;

    setErrorMessage(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      // integrate api
      if (userId) clearPendingEmailChange(userId);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't verify your email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setNotice(null);
    setIsResending(true);
    start();

    try {
      // integrate api
      setNotice("We've sent a new code to your email.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't verify your email. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <form
        aria-label="Input confirmation code"
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-3">
          <div
            role="group"
            aria-label="Verification code"
            className="flex gap-2.5"
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(node) => {
                  inputs.current[idx] = node;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${idx + 1} of ${CODE_LENGTH}`}
                value={digit}
                maxLength={CODE_LENGTH}
                autoFocus={idx === 0}
                onChange={(event) => handleChange(idx, event.target.value)}
                onKeyDown={(event) => handleKeyDown(idx, event)}
                onPaste={handlePaste}
                onFocus={(event) => event.target.select()}
                className={cn(
                  "size-11 min-[380px]:size-12 sm:size-14 rounded-xl border border-grey-300 bg-white text-center text-xl font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
                  errorMessage &&
                    "border-danger-600 focus:border-danger-600 focus:ring-danger-600/20",
                )}
              />
            ))}
          </div>
          {errorMessage && (
            <p role="alert" className="text-body-md text-danger-600">
              {errorMessage}
            </p>
          )}
          {notice && (
            <p role="status" className="text-body-md text-brand-600">
              {notice}
            </p>
          )}
        </div>

        <p className="text-muted-foreground text-[14px] font-medium">
          Did not get it?{" "}
          <button
            type="button"
            disabled
            onClick={handleResend}
            className="font-semibold underline decoration-solid text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {" "}
            {/* disabled={isResending || remaining > 0} */}
            {isResending ? (
              <span className="inline-flex items-center gap-1">
                <LoadingSpinner className="h-4 w-4" />
                Resending...
              </span>
            ) : remaining > 0 ? (
              `Resend code in ${remaining}s`
            ) : (
              "Resend code"
            )}
          </button>
        </p>

        <div className="flex gap-3 mt-2">
          <Button isPrimary={false} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled>
            {" "}
            {/* disable={!isComplete || isSubmitting} */}
            Confirm email
          </Button>
        </div>
      </form>
    </div>
  );
}
