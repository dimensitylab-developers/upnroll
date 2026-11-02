"use client";

import { useActionState, useState } from "react";
import { createContentAction, type ContentActionState } from "./actions";
import { CONTENT_TYPE_OPTIONS } from "./content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const initialState: ContentActionState = {};

export function CreateContentForm() {
  const [state, formAction, pending] = useActionState(createContentAction, initialState);
  const [type, setType] = useState<string>("FAQ");

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      <div>
        <Label className="mb-1.5 block">Type</Label>
        <input type="hidden" name="type" value={type} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Content type"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CONTENT_TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="title" className="mb-1.5 block">Title / question</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="body" className="mb-1.5 block">Body / answer</Label>
        <Textarea id="body" name="body" required rows={4} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Create"}</Button>
    </form>
  );
}
