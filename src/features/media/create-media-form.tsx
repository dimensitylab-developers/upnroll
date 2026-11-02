"use client";

import { useActionState } from "react";
import { createMediaAction, type MediaActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: MediaActionState = {};

export function CreateMediaForm() {
  const [state, formAction, pending] = useActionState(createMediaAction, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      <div>
        <Label htmlFor="caption" className="mb-1.5 block">Caption</Label>
        <Input id="caption" name="caption" required />
      </div>
      <div>
        <Label htmlFor="externalUrl" className="mb-1.5 block">Media URL</Label>
        <Input id="externalUrl" name="externalUrl" required placeholder="https://..." />
        <p className="text-xs text-muted-foreground mt-1">External URL only — real storage/CDN pending OD-012.</p>
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add media"}</Button>
    </form>
  );
}
