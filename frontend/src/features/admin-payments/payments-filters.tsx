"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";

type EventOption = { id: string; name: string };

function setParam(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) params.set(key, value);
  else params.delete(key);
}

export function PaymentsFilters({
  events,
  defaultQ,
  defaultEventId,
  defaultFrom,
  defaultTo,
}: {
  events: EventOption[];
  defaultQ: string;
  defaultEventId: string;
  defaultFrom: string;
  defaultTo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function replaceParams(mutate: (next: URLSearchParams) => void) {
    startTransition(() => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  const fieldClass =
    "h-10 border-2 border-black bg-white text-sm shadow-[3px_3px_0_0_#000] focus-visible:ring-0";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        defaultValue={defaultQ}
        placeholder="Search email or UTR…"
        aria-label="Search payments by email or UTR"
        className={fieldClass}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          replaceParams((next) => setParam(next, "q", value));
        }}
      />

      <select
        aria-label="Filter by event"
        defaultValue={defaultEventId}
        disabled={pending}
        className={`${fieldClass} px-3`}
        onChange={(e) => {
          const value = e.target.value;
          replaceParams((next) => setParam(next, "event", value));
        }}
      >
        <option value="">All events</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      <Input
        type="date"
        defaultValue={defaultFrom}
        aria-label="From date"
        className={fieldClass}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          replaceParams((next) => setParam(next, "from", value));
        }}
      />

      <Input
        type="date"
        defaultValue={defaultTo}
        aria-label="To date"
        className={fieldClass}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          replaceParams((next) => setParam(next, "to", value));
        }}
      />
    </div>
  );
}
