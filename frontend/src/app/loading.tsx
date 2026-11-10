import { RouteSkeleton } from "@/components/layout/route-skeleton";

/** Root fallback — scoped skeleton so the shell is not covered. */
export default function Loading() {
  return <RouteSkeleton />;
}
