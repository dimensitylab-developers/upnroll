"use client";

import { useActionState } from "react";
import { retryOutboxJobAction, type NotificationActionState } from "./actions";
import { Button } from "@/components/ui/button";

type Job = {
  _id: string;
  type: string;
  status: string;
  lastError?: string;
  attempts: number;
  runAt: Date | string;
  updatedAt?: Date | string;
};

export function AdminOutboxPanel({ jobs }: { jobs: Job[] }) {
  const [state, retry, retrying] = useActionState(retryOutboxJobAction, {} as NotificationActionState);

  return (
    <div>
      {state.error && <p className="mb-3 text-sm text-destructive">{state.error}</p>}
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={String(j._id)} className="border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#c8102e] sm:p-4">
            <p className="break-words font-semibold">{j.type}</p>
            <p className="text-xs text-muted-foreground">
              Attempts {j.attempts} · run at {new Date(j.runAt).toLocaleString()}
            </p>
            {j.lastError && <p className="mt-2 break-words text-sm text-destructive">{j.lastError}</p>}
            <form action={retry} className="mt-3">
              <input type="hidden" name="jobId" value={String(j._id)} />
              <Button type="submit" size="sm" disabled={retrying} className="min-h-10 w-full border-2 border-black sm:w-auto">
                Retry job
              </Button>
            </form>
          </li>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground">No failed outbox jobs.</p>}
      </ul>
    </div>
  );
}
