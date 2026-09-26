import { Skeleton } from "@/components/primitives";
import CareerDetailPage from "./CareerDetailPage";

export default function DetailSkeleton() {
  return (
    <CareerDetailPage>
      <div role="status" aria-label="Loading career">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="mt-3 h-5 w-1/2" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="mt-10">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </CareerDetailPage>
  );
}
