import clsx from "clsx";
import type { TrackIconKey } from "../features/skillCheck/skillCheck.types";
import { getTrackIconUrl } from "./trackIcons";

export function TrackIcon({
  icon,
  size,
  className,
}: {
  icon: TrackIconKey;
  size: number;
  className?: string;
}) {
  const url = getTrackIconUrl(icon, size);

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
