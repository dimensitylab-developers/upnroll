"use client";

import { useActionState, useState } from "react";
import { updateScheduleAction, type MatchActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialState: MatchActionState = {};

function toLocalDatetimeValue(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleMatchDialog({
  eventId,
  matchId,
  currentScheduledAt,
  currentMat,
}: {
  eventId: string;
  matchId: string;
  currentScheduledAt?: string | Date | null | undefined;
  currentMat?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateScheduleAction, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {currentScheduledAt || currentMat ? "Edit schedule" : "Schedule"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule match</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="matchId" value={matchId} />
          {state.error && <p className="text-sm text-primary">{state.error}</p>}

          <div>
            <Label htmlFor="scheduledAt" className="mb-1.5 block">Date and time</Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={toLocalDatetimeValue(currentScheduledAt)}
            />
          </div>

          <div>
            <Label htmlFor="mat" className="mb-1.5 block">Mat / ring</Label>
            <Input id="mat" name="mat" defaultValue={currentMat} placeholder="e.g. Mat 2" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
