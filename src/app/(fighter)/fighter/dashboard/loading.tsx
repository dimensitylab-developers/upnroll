import { Skeleton } from "@/components/ui/skeleton";

export default function FighterDashboardLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <Skeleton className="h-8 w-64" />

      <div className="grid sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
