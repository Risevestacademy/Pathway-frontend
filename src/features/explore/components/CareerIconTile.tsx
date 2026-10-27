import clsx from "clsx";
import { BriefcaseBusiness } from "lucide-react";
import { TrackIcon } from "@/components/TrackIcon";
import { careerIconKey } from "../explore.utils";

/** The career's track icon (which carries its own tinted tile), or a neutral tile when there is none. */
export default function CareerIconTile({
  title,
  slug,
  size,
  className,
}: {
  title: string;
  slug?: string;
  size: number;
  className?: string;
}) {
  const icon = careerIconKey(title, slug);
  if (icon) return <TrackIcon icon={icon} size={size} className={clsx("rounded-[14px]", className)} />;

  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={clsx("grid shrink-0 place-items-center rounded-[14px] bg-brand-50 text-brand-500", className)}
    >
      <BriefcaseBusiness className="size-1/2" strokeWidth={1.75} />
    </span>
  );
}
