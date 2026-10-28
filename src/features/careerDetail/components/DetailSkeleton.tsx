import { Skeleton } from "@/components/ui/Skeleton";
import CareerDetailPage from "./CareerDetailPage";

export default function DetailSkeleton() {
  return (
    <CareerDetailPage>
      <div role="status" aria-label="Loading career">
        <section className="rounded-2xl border border-line bg-surface p-6 sm:p-10">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="mt-4 h-5 w-full max-w-[65ch]" />
          <Skeleton className="mt-2 h-5 w-4/5 max-w-[65ch]" />
          <Skeleton className="mt-6 h-10 w-36" />
        </section>

        <div className="mt-3 flex flex-col gap-6">
          <SkeletonCard lines={3} />
          <section>
            <Skeleton className="h-6 w-48" />
            <div className="mt-3 grid gap-3">
              <SkeletonEntryCard />
              <SkeletonEntryCard />
              <SkeletonEntryCard />
            </div>
          </section>
          <SkeletonCard lines={2} />
        </div>
      </div>
    </CareerDetailPage>
  );
}

function SkeletonEntryCard() {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-4 w-4/5" />
    </div>
  );
}

function SkeletonCard({ lines }: { lines: number }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-6">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={
            index === 0
              ? "mt-4 h-4 w-full"
              : index === lines - 1
                ? "mt-2 h-4 w-3/4"
                : "mt-2 h-4 w-full"
          }
        />
      ))}
    </section>
  );
}
