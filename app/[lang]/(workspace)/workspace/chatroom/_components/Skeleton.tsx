import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonComponent() {
  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4 min-h-[50vh]">
      <Skeleton className="h-6 w-1/3 bg-white" />
      <Skeleton className="h-6 w-1/2 bg-white" />
      <Skeleton className="h-6 w-1/4 bg-white" />
    </div>
  );
}
