import clsx from "clsx";
import { useEffect, useId, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  compact = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={clsx(
        "m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-150 overflow-y-auto",
        "rounded-3xl border border-grey-100 bg-surface p-0 text-ink",
        !compact && "shadow-[0_12px_32px_rgba(0,0,0,0.16)]",
        "backdrop:bg-black/50",
        "open:animate-in open:fade-in open:zoom-in-95 open:duration-200 open:ease-out motion-reduce:open:animate-none",
        className,
      )}
    >
      <div className={clsx("flex flex-col gap-4", compact ? "p-6" : "p-8")}>
        <h2 id={titleId} className="font-display text-2xl leading-7 font-medium">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-base leading-5 text-grey-600">
            {description}
          </p>
        )}
        {children}
      </div>
    </dialog>
  );
}
