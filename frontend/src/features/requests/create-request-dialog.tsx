"use client";

import { useActionState, useState } from "react";
import { createRequestAction, type RequestActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialState: RequestActionState = {};

export function CreateRequestDialog({
  registrationId,
  otherDivisions,
}: {
  registrationId: string;
  otherDivisions: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"CANCELLATION" | "TRANSFER">("CANCELLATION");
  const [divisionId, setDivisionId] = useState("");
  const [state, formAction, pending] = useActionState(createRequestAction, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Request change</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Cancellation / transfer request</DialogTitle></DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="registrationId" value={registrationId} />
          <input type="hidden" name="type" value={type} />
          {type === "TRANSFER" && <input type="hidden" name="requestedDivisionId" value={divisionId} />}
          {state.error && <p className="text-sm text-primary">{state.error}</p>}

          <RadioGroup value={type} onValueChange={(v) => setType(v as "CANCELLATION" | "TRANSFER")}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="CANCELLATION" id="type-cancel" />
              <Label htmlFor="type-cancel">Cancel my registration</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="TRANSFER" id="type-transfer" disabled={otherDivisions.length === 0} />
              <Label htmlFor="type-transfer">Transfer to another division</Label>
            </div>
          </RadioGroup>

          {type === "TRANSFER" && (
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger aria-label="Target division"><SelectValue placeholder="Select target division" /></SelectTrigger>
              <SelectContent>
                {otherDivisions.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <Textarea name="reason" placeholder="Reason for this request" required />

          <p className="text-xs text-muted-foreground">
            Cancel one month or more before the event and the refund is 50%. Inside that month there is no refund. A teammate transfer is free and keeps the same bracket spot.
          </p>

          <DialogFooter>
            <Button type="submit" disabled={pending || (type === "TRANSFER" && !divisionId)}>
              {pending ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
