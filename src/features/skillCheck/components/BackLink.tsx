import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import type { LinkComponentProps } from "@tanstack/react-router";
import { ChevronsLeft } from "lucide-react";

const backClass =
  "focus-ring mb-4 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-grey-50 py-2 pr-3 pl-2 text-base leading-5 font-medium text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-100 motion-reduce:transition-none";

export function BackLink({
  label = "Back",
  fallbackTo = "/skill-check",
  to,
  careerId,
}: {
  label?: string;
  fallbackTo?: "/skill-check" | "/careers";
  to?: "/careers" | "/careers/$careerId";
  careerId?: string;
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  if (to === "/careers") {
    return (
      <Link to="/careers" className={backClass}>
        <ChevronsLeft aria-hidden className="size-6" />
        {label}
      </Link>
    );
  }

  if (to === "/careers/$careerId" && careerId) {
    return (
      <Link to="/careers/$careerId" params={{ careerId }} className={backClass}>
        <ChevronsLeft aria-hidden className="size-6" />
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : void navigate({ to: fallbackTo }))}
      className={backClass}
    >
      <ChevronsLeft aria-hidden className="size-6" />
      {label}
    </button>
  );
}

/** The same back link, pointing at any route (e.g. a roadmap step). */
export function BackLinkTo({
  label,
  ...props
}: Omit<LinkComponentProps<"a">, "children" | "className"> & { label: string }) {
  return (
    <Link {...props} className={backClass}>
      <ChevronsLeft aria-hidden className="size-6" />
      {label}
    </Link>
  );
}
