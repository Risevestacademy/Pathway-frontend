import clsx from "clsx";
import type { ComponentType, SVGProps } from "react";

const files = import.meta.glob("/src/assets/icons/nav/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName = new Map(
  Object.entries(files).map(([path, url]) => [
    path.split("/").pop()!.replace(/\.svg$/i, "").toLowerCase(),
    url,
  ]),
);

export function NavIcon({
  name,
  fallback: Fallback,
  className,
}: {
  name: string;
  fallback: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}) {
  const url = byName.get(name);
  if (!url) return <Fallback aria-hidden className={clsx("size-6 shrink-0", className)} />;
  return (
    <span
      aria-hidden
      className={clsx("inline-block size-6 shrink-0 bg-current", className)}
      style={{
        maskImage: `url("${url}")`,
        WebkitMaskImage: `url("${url}")`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
