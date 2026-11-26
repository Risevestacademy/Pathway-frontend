import { Modal } from "@/components/ui/Modal";
import { EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "cn";

export default function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const close = () => {
    onClose();
  };
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [passwordError, setPasswordError] = useState<string | null>();
  const [newPasswordError, setNewPasswordError] = useState<string | null>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setNewPasswordError("Must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Must match new password.");
      return;
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Change your password"
      description="Choose a new password. You will stay signed in on this device."
    >
      <form
        aria-label="Change password form"
        className="flex flex-col gap-3"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label htmlFor="current-password" className="mb-2">
            Current password
          </label>
          <div className="relative">
            <input
              id="current-password"
              name="current password"
              type={showPassword ? "text" : "password"}
              required
              aria-required
              autoComplete="current-password"
              placeholder="********"
              className="auth-input pr-11"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="focus-ring absolute inset-y-0 right-1 flex min-w-11 items-center justify-center rounded-lg text-grey-500"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="new-password" className="mb-2">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="new password"
              type={showNewPassword ? "text" : "password"}
              required
              aria-required
              autoComplete="new-password"
              placeholder="********"
              className={cn(
                "auth-input pr-11",
                newPasswordError &&
                  "border-danger-600 focus:border-danger-600 focus:ring-danger-600/20",
              )}
              onChange={(e) => {
                setNewPasswordError(null);
                setNewPassword(e.target.value);
              }}
              value={newPassword}
            />
            <button
              type="button"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              onClick={() => setShowNewPassword((current) => !current)}
              className="focus-ring absolute inset-y-0 right-1 flex min-w-11 items-center justify-center rounded-lg text-grey-500"
            >
              {showNewPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p
            className={cn(
              "text-[13px] font-medium text-muted-foreground pt-2",
              newPasswordError && "text-danger-600",
            )}
          >
            At least 8 characters.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-new-password" className="mb-2">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirm-new-password"
              name="confirm new password"
              type={showConfirmPassword ? "text" : "password"}
              required
              aria-required
              autoComplete="new-password"
              placeholder="********"
              className={cn(
                "auth-input pr-11",
                confirmPasswordError &&
                  "border-danger-600 focus:border-danger-600 focus:ring-danger-600/20",
              )}
              onChange={(e) => {
                setConfirmPasswordError(null);
                setConfirmPassword(e.target.value);
              }}
              value={confirmPassword}
            />
            <button
              type="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="focus-ring absolute inset-y-0 right-1 flex min-w-11 items-center justify-center rounded-lg text-grey-500"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p
            className={cn(
              "text-[13px] font-medium text-muted-foreground pt-2",
              confirmPasswordError && "text-danger-600",
            )}
          >
            {confirmPasswordError}
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <Button isPrimary={false} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled>
            Update password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
