import { Skeleton } from "@/components/ui/Skeleton";
import OpportunitiesFrame from "./OpportunitiesFrame";
import { BackLinkTo } from "@/features/skillCheck/components/BackLink";

export default function OpportunitiesSkeleton() {
  return (
    <div className="flex gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-105 h-75" />
      ))}
    </div>
  );
}

export function OpportunitySkeleton() {
  return (
    <OpportunitiesFrame>
      <BackLinkTo label="Back" to="/opportunities" />
      <div className="mt-6">
        <div className="flex gap-2 mb-4">
          <Skeleton className="w-10 h-8" />
          <Skeleton className="w-10 h-8" />
        </div>

        <div className="flex flex-col gap-1 mb-10">
          <Skeleton className="w-15 h-9" />
          <Skeleton className="w-30 h-9" />
          <div className="flex gap-2 mb-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="w-10 h-8" />
            ))}
          </div>
        </div>
      </div>

      <div>
        <Skeleton className="w-full h-50" />
      </div>
    </OpportunitiesFrame>
  );
}
