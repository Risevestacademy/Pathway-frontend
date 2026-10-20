import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronsLeft } from "lucide-react";

const backClass =
  "focus-ring mb-4 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-grey-50 py-2 pr-3 pl-2 text-base leading-5 font-medium text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-100 motion-reduce:transition-none";

export function BackLink({
  label = "Back",
  fallbackTo = "/skill-check",
}: {
  label?: string;
  fallbackTo?: "/skill-check" | "/careers";
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

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
