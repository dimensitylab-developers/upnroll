"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

type EventOption = { id: string; name: string };

const SEARCH_DEBOUNCE_MS = 300;

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
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(defaultQ);
  const latestParams = useRef(searchParams);
  latestParams.current = searchParams;

  useEffect(() => {
    setQ(defaultQ);
  }, [defaultQ]);

  function replaceParams(mutate: (next: URLSearchParams) => void) {
    startTransition(() => {
      const next = new URLSearchParams(latestParams.current.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  useEffect(() => {
    const trimmed = q.trim();
    const current = latestParams.current.get("q") ?? "";
    if (trimmed === current) return;

    const timer = window.setTimeout(() => {
      replaceParams((next) => setParam(next, "q", trimmed));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // replaceParams closes over stable router/pathname; debounce only on q
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const fieldClass =
    "h-10 border-2 border-black bg-white text-sm shadow-[3px_3px_0_0_#000] focus-visible:ring-0";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search email or UTR…"
        aria-label="Search payments by email or UTR"
        className={fieldClass}
        autoComplete="off"
      />

      <select
        aria-label="Filter by event"
        defaultValue={defaultEventId}
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
        onChange={(e) => {
          const value = e.target.value;
          replaceParams((next) => setParam(next, "to", value));
        }}
      />
    </div>
  );
}
