import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "cn";

const CODE_LENGTH = 6;

export default function VerifyEmailChange({
  onClose,
}: {
  onClose: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [errorMessage] = useState<string | null>();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

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

  return (
    <div>
      <form
        aria-label="Input confirmation code"
        className="flex flex-col gap-5"
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
        </div>

        <p className="text-muted-foreground text-[14px] font-medium">
          Did not get it?{" "}
          <span className="text-brand-600 underline decoration-solid">
            Resend code
          </span>
        </p>

        <div className="flex gap-3 mt-2">
          <Button isPrimary={false} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Confirm email</Button>
        </div>
      </form>
    </div>
  );
}
