import clsx from "clsx";
import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  spacious = false,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  spacious?: boolean;
}) {
  return (
    <header className={clsx("flex flex-col", spacious ? "gap-2" : "gap-1")}>
      {eyebrow && <p className="text-sm leading-4 font-medium text-brand-600">{eyebrow}</p>}
      <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
        {title}
      </h1>
      {description && <p className="text-base leading-5 text-grey-600">{description}</p>}
    </header>
  );
}
