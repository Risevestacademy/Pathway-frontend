import { DropdownMenu } from "radix-ui";
import { useRef, useState } from "react";
import { useAuthStore } from "../lib/stores/authStore";
import { ReportIssueDialog } from "../features/feedback/components/ReportIssueDialog";
import { SignOutDialog } from "../features/auth/components/SignOutDialog";
import { Link } from "@tanstack/react-router";

const avatarFiles = import.meta.glob("/src/assets/images/avatar.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const avatarUrl = Object.values(avatarFiles)[0] ?? null;

const itemClass =
  "flex h-11 cursor-pointer items-center rounded-lg px-4 text-base text-ink outline-none select-none data-highlighted:bg-brand-50 data-highlighted:text-brand-600";

type OpenDialog = "feedback" | "sign-out" | null;

/** The avatar in the top nav, with the signed-in learner's account actions. */
export function AccountMenu() {
  const user = useAuthStore((state) => state.user);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openingDialog = useRef(false);

  const email = user?.email ?? "";
  const name = user?.fullName ?? user?.name;
  const initial = email.trim().charAt(0).toUpperCase();

  const open = (next: Exclude<OpenDialog, null>) => {
    openingDialog.current = true;
    setDialog(next);
  };

  const close = () => {
    setDialog(null);
    triggerRef.current?.focus();
  };

  return (
    <>
      {/* Non-modal, so closing the menu as a dialog opens can't leave the page unclickable. */}
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger
          ref={triggerRef}
          aria-label="Account menu"
          className="focus-ring size-10 shrink-0 cursor-pointer rounded-full"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-10 rounded-full" />
          ) : (
            <span className="grid size-10 place-items-center rounded-full bg-accent-500 text-base font-semibold text-grey-900">
              {initial}
            </span>
          )}
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={12}
            // Focus belongs in the dialog that's opening, not back on the avatar.
            onCloseAutoFocus={(event) => {
              if (openingDialog.current) {
                event.preventDefault();
                openingDialog.current = false;
              }
            }}
            className="z-30 flex w-72 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-grey-100 bg-surface p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {name && <p className="truncate text-base text-ink">{name}</p>}
              <p className={name ? "truncate text-sm text-ink-muted" : "truncate text-base text-ink"}>{email}</p>
            </div>
            <DropdownMenu.Separator className="mx-2 my-1 h-px bg-grey-100" />
            <DropdownMenu.Item asChild className={itemClass}>
              <Link to="/profile">Profile</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={itemClass} onSelect={() => open("feedback")}>
              Send feedback
            </DropdownMenu.Item>
            <DropdownMenu.Item className={itemClass} onSelect={() => open("sign-out")}>
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ReportIssueDialog open={dialog === "feedback"} onClose={close} section="GENERAL" />
      <SignOutDialog open={dialog === "sign-out"} onClose={close} />
    </>
  );
}
