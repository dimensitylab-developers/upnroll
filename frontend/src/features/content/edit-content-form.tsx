"use client";

import { useActionState, useState } from "react";
import { updateContentAction, type ContentActionState } from "./actions";
import { CONTENT_TYPE_OPTIONS } from "./content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function EditContentForm({
  entryId,
  type: initialType,
  title,
  body,
}: {
  entryId: string;
  type: string;
  title: string;
  body: string;
}) {
  const [state, formAction, pending] = useActionState(updateContentAction, {} as ContentActionState);
  const [type, setType] = useState(initialType);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3 border-t-2 border-black/10 pt-4">
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="type" value={type} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div>
        <Label className="mb-1.5 block text-xs">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Content type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`title-${entryId}`} className="mb-1.5 block text-xs">
          Title / question
        </Label>
        <Input id={`title-${entryId}`} name="title" defaultValue={title} required />
      </div>
      <div>
        <Label htmlFor={`body-${entryId}`} className="mb-1.5 block text-xs">
          Body / answer
        </Label>
        <Textarea id={`body-${entryId}`} name="body" defaultValue={body} required rows={4} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
