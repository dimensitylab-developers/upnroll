"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ProfileActionState = {};

export function ProfileForm({ displayName, gym, discipline }: { displayName: string; gym: string; discipline: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-cyan">Profile updated.</p>}
      <div>
        <Label htmlFor="displayName" className="mb-1.5 block">Display name</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required />
      </div>
      <div>
        <Label htmlFor="gym" className="mb-1.5 block">Gym / team</Label>
        <Input id="gym" name="gym" defaultValue={gym} />
      </div>
      <div>
        <Label htmlFor="discipline" className="mb-1.5 block">Discipline</Label>
        <Input id="discipline" name="discipline" defaultValue={discipline} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
