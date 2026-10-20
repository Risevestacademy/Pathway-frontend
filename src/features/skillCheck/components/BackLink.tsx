import { Link } from "@tanstack/react-router";
import { ChevronsLeft } from "lucide-react";

export function BackLink({ label = "Back" }: { label?: string }) {
  return (
    <Link
      to="/skill-check"
      className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-lg bg-grey-50 py-2 pr-3 pl-2 text-base leading-5 font-medium text-grey-500 transition-colors hover:bg-grey-100 motion-reduce:transition-none"
    >
      <ChevronsLeft aria-hidden className="size-6" />
      {label}
    </Link>
  );
}
