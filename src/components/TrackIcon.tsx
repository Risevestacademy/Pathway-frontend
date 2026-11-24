import clsx from "clsx";
import type { TrackIconKey } from "../features/skillCheck/skillCheck.types";
import { getTrackIconUrl } from "./trackIcons";

export function TrackIcon({
  icon,
  size,
  className,
}: {
  /** Null draws the neutral tile, for a career with no icon yet. */
  icon: TrackIconKey | null;
  size: number;
  className?: string;
}) {
  const url = icon ? getTrackIconUrl(icon, size) : undefined;

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
