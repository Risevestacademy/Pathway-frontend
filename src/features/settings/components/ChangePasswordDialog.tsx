import { Modal } from "@/components/ui/Modal";
import { EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Modal
      open={open}
      onClose={close}
      title="Change your passowrd"
      description="Choose a new password. You will stay signed in on this device."
    >
      <form aria-label="Change password form" className="flex flex-col gap-3">
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
              className="auth-input pr-11"
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
          <p className="text-[13px] font-medium text-muted-foreground pt-2">
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
              className="auth-input pr-11"
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
        </div>

        <div className="flex gap-3 mt-2">
          <Button isPrimary={false} onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Update password</Button>
        </div>
      </form>
    </Modal>
  );
}
