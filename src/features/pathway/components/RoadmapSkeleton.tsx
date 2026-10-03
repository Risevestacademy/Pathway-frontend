import { Skeleton } from "@/components/ui/Skeleton";
import RoadmapPage from "./RoadmapPage";

export default function RoadmapSkeleton() {
  return (
    <RoadmapPage>
      <div role="status" aria-label="Loading roadmap">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-4 w-32" />
        <Skeleton className="mt-2 h-9 w-2/3" />
        <Skeleton className="mt-3 h-5 w-1/2" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mt-6 rounded-lg border border-line p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </RoadmapPage>
  );
}
