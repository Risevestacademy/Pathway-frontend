import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_protected/settings");

export default function InputNewEmail({ onClose }: { onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>();
  const navigate = routeApi.useNavigate();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({
      search: (prev) => ({ ...prev, "verify-email": email }),
    });
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
        aria-label="Change email form"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="new-email"
            className="font-medium text-body-md leading-[100%]"
          >
            New email
          </label>
          <input
            id="new-email"
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="auth-input"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label
          htmlFor="password"
          className="font-medium text-body-md leading-[100%]"
        >
          Your password
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="********"
              className="auth-input pr-11"
              autoComplete="current-password"
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
        </label>

        <div className="flex gap-3 mt-2">
          <Button isPrimary={false} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Send Code</Button>
        </div>
      </form>
    </div>
  );
}
