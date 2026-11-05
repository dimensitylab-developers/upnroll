"use client";

import { useActionState, useState } from "react";
import { recordResultAction, correctResultAction, type MatchActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialState: MatchActionState = {};

export function MatchResultDialog({
  eventId,
  matchId,
  competitorAId,
  competitorAName,
  competitorBId,
  competitorBName,
  mode,
  currentWinnerId,
  currentMethod,
}: {
  eventId: string;
  matchId: string;
  competitorAId: string;
  competitorAName: string;
  competitorBId: string;
  competitorBName: string;
  mode: "record" | "correct";
  currentWinnerId?: string;
  currentMethod?: string;
}) {
  const [open, setOpen] = useState(false);
  const action = mode === "record" ? recordResultAction : correctResultAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={mode === "record" ? "default" : "outline"}>
          {mode === "record" ? "Record result" : "Correct result"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "record" ? "Record match result" : "Correct match result"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="matchId" value={matchId} />
          {state.error && <p className="text-sm text-primary">{state.error}</p>}

          <div>
            <Label className="mb-2 block">Winner</Label>
            <RadioGroup name="winnerRegistrationId" defaultValue={currentWinnerId}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={competitorAId} id="winner-a" />
                <Label htmlFor="winner-a">{competitorAName}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={competitorBId} id="winner-b" />
                <Label htmlFor="winner-b">{competitorBName}</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="method" className="mb-1.5 block">Result method</Label>
            <Input id="method" name="method" defaultValue={currentMethod} placeholder="e.g. Submission, Decision, DQ" required />
          </div>

          {mode === "correct" && (
            <div>
              <Label htmlFor="reason" className="mb-1.5 block">Reason for correction</Label>
              <Textarea id="reason" name="reason" required placeholder="Why is this result being corrected?" />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
