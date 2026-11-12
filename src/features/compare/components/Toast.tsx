import clsx from "clsx";
import { Info } from "lucide-react";
import type { ToastState } from "../hooks/useToast";

export default function Toast({ toast }: { toast: ToastState | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      {toast && (
        <p
          key={toast.id}
          className={clsx(
            "flex max-w-md items-start gap-2 rounded-xl border border-grey-200 bg-grey-900 p-3.5 text-base leading-6 text-grey-50 shadow-overlay",
            "animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none",
            "transition-[opacity,translate] duration-200 motion-reduce:transition-none",
            !toast.open && "translate-y-2 opacity-0",
          )}
        >
          <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
          {toast.message}
        </p>
      )}
    </div>
  );
}