import clsx from "clsx";
import type { TrackIconKey } from "../features/skillCheck/skillCheck.types";

type Variant = "small" | "medium" | "large";

const files = import.meta.glob("/src/assets/icons/tracks/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const registry: Record<string, Partial<Record<Variant, string>>> = {};

for (const [path, url] of Object.entries(files)) {
  const base = normalise(path.split("/").pop()?.replace(/\.svg$/i, "") ?? "");
  const variant: Variant = base.endsWith("small")
    ? "small"
    : base.endsWith("medium")
      ? "medium"
      : "large";
  const key = variant === "large" ? base : base.slice(0, -variant.length);
  registry[key] = { ...registry[key], [variant]: url };
}

function pickVariant(size: number): Variant[] {
  if (size <= 48) return ["small", "medium", "large"];
  if (size <= 96) return ["medium", "large", "small"];
  return ["large", "medium", "small"];
}

export function TrackIcon({
  icon,
  size,
  className,
}: {
  icon: TrackIconKey;
  size: number;
  className?: string;
}) {
  const variants = registry[normalise(icon)];
  const url = variants
    ? pickVariant(size)
        .map((variant) => variants[variant])
        .find(Boolean)
    : undefined;

  if (!url) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={clsx("inline-block shrink-0 rounded-[10px] bg-brand-100", className)}
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      className={clsx("shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
