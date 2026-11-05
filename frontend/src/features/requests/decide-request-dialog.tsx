"use client";

import { useActionState } from "react";
import { decideRequestAction, type RequestActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const initialState: RequestActionState = {};

export function DecideRequestDialog({ requestId, summary }: { requestId: string; summary: string }) {
  const [state, formAction, pending] = useActionState(decideRequestAction, initialState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review request</DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="requestId" value={requestId} />
          {state.error && <p className="text-sm text-primary">{state.error}</p>}
          <Textarea name="note" placeholder="Review note" />
          <DialogFooter className="gap-2">
            <Button type="submit" name="decision" value="REJECTED" variant="destructive" disabled={pending}>Reject</Button>
            <Button type="submit" name="decision" value="APPROVED" disabled={pending}>Approve</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
