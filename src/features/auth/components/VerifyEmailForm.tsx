import { Link } from "@tanstack/react-router";
import {
  useRef,
  useState,
  type ClipboardEvent,
  type SyntheticEvent,
  type KeyboardEvent,
} from "react";
import mailBox from "@/assets/icons/mail-box.svg";
import repeatIcon from "@/assets/icons/repeat-icon.svg";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useResendCooldown } from "../hooks/useResendCooldown";

const CODE_LENGTH = 6;

export default function VerifyEmailForm({
  email,
  onSubmit,
  onResend,
}: {
  email: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill(""),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const { remaining, start } = useResendCooldown();

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH;

  const focusAt = (index: number) =>
    inputs.current[Math.min(Math.max(index, 0), CODE_LENGTH - 1)]?.focus();

  const handleChange = (index: number, value: string) => {
    const entered = value.replace(/\D/g, "");
    if (!entered) {
      setDigits((current) => current.map((d, i) => (i === index ? "" : d)));
      return;
    }

    // Fills this box and spills any extra digits (autofill, fast typing) forward.
    setDigits((current) => {
      const next = [...current];
      entered
        .slice(0, CODE_LENGTH - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      return next;
    });
    focusAt(index + entered.length);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent) => {
    if (event.key === "Backspace" && !digits[index]) {
      focusAt(index - 1);
    } else if (event.key === "ArrowLeft") {
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ""));
    focusAt(pasted.length);
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!isComplete) return;

    setErrorMessage(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      await onSubmit(code);
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
      await onResend();
      setNotice("We've sent a new code to your email.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't resend the code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex w-full flex-1 items-center justify-center overflow-y-auto px-4 py-8 sm:px-8">
      <form
        onSubmit={handleSubmit}
        aria-labelledby="verify-heading"
        className="w-full max-w-93.75 flex flex-col gap-6 items-center text-center font-display animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none"
      >
        <div className="flex flex-col gap-4 items-center">
          <img alt="" src={mailBox} />
          <h1 id="verify-heading" className="text-heading">
            Verify your email!
          </h1>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <p className="text-body-md text-grey-500">We sent an email to</p>
          <p className="text-body-lg text-2xl text-grey-900 underline decoration-dotted decoration-grey-300 underline-offset-[11%] break-all">
            {email.toLowerCase()}
          </p>
          <Link
            to="/signup"
            className="flex gap-0.5 items-center text-brand-600 hover:text-brand-700"
          >
            <img alt="" src={repeatIcon} />
            <span>Change email address</span>
          </Link>
        </div>

        <div
          role="group"
          aria-label="Verification code"
          className="flex justify-center gap-2 sm:gap-3"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
              value={digit}
              maxLength={CODE_LENGTH}
              autoFocus={index === 0}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              onFocus={(event) => event.target.select()}
              className="size-11 min-[380px]:size-12 sm:size-14 rounded-xl border border-grey-300 bg-white text-center text-xl font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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

        <Button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Verifying..." : "Verify and create account"}
        </Button>

        <p className="text-body-md text-grey-500">
          Already verified?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Log in
          </Link>
          <br />
          Haven&apos;t received a code?{" "}
          <button
            type="button"
            disabled={isResending || remaining > 0}
            onClick={handleResend}
            className="font-semibold text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
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
      </form>
    </div>
  );
}
