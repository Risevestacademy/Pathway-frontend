import { groupByGeo } from "../careerDetail.utils";
import type { Statistic } from "@/features/careerDetail/careerDetail.types";
import { MapPin } from "lucide-react";
import { StatCard } from "./statCard";

export default function StatGroup({
  title,
  stats,
}: {
  title: string;
  stats: Statistic[];
}) {
  if (stats.length === 0) return null;
  const byGeo = groupByGeo(stats);
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">
        {title}
      </h3>
      <div className="grid gap-5">
        {[...byGeo].map(([geo, list]) => (
          <div key={geo}>
            <p className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-ink">
              <MapPin className="size-4 text-ink-subtle" /> {geo}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((s) => (
                <StatCard key={s.id} stat={s} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
