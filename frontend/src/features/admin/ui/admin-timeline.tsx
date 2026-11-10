import { AdminEmpty } from "./admin-empty";

export type TimelineItem = {
  id: string;
  title: string;
  meta: string;
  stamp: string;
};

export function AdminTimeline({
  items,
  empty,
}: {
  items: TimelineItem[];
  empty: string;
}) {
  if (items.length === 0) return <AdminEmpty>{empty}</AdminEmpty>;

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <ul className="divide-y divide-black/10">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
            <div className="min-w-0">
              <p className="break-words text-sm font-medium">{item.title}</p>
              <p className="break-words text-xs text-muted-foreground">{item.meta}</p>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">{item.stamp}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function formatTimelineStamp(value: Date | string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
