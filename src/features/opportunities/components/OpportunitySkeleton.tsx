import { Skeleton } from "@/components/ui/Skeleton";

export default function OpportunitiesSkeleton() {
  return (
    <div className="flex gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-105 h-75" />
      ))}
    </div>
  );
}
