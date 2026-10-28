import type { TrackIconKey } from "../features/skillCheck/skillCheck.types";

type Variant = "small" | "medium" | "large" | "header";

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
      : base.endsWith("header")
        ? "header"
        : "large";
  const key = variant === "large" ? base : base.slice(0, -variant.length);
  registry[key] = { ...registry[key], [variant]: url };
}

function pickVariant(size: number): Variant[] {
  if (size <= 48) return ["small", "medium", "large"];
  if (size <= 96) return ["medium", "large", "small"];
  return ["large", "medium", "small"];
}

export function getTrackIconUrl(icon: TrackIconKey, size: number): string | undefined {
  const variants = registry[normalise(icon)];
  if (!variants) return undefined;
  return pickVariant(size)
    .map((variant) => variants[variant])
    .find(Boolean);
}

export function getTrackHeroUrl(icon: TrackIconKey): string | undefined {
  const variants = registry[normalise(icon)];
  if (!variants) return undefined;
  return variants.header ?? variants.large ?? variants.medium ?? variants.small;
}

export function hasTrackIcon(icon: TrackIconKey): boolean {
  return getTrackIconUrl(icon, 200) !== undefined;
}
