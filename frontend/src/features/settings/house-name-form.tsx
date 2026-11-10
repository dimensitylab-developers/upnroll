"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateHouseNameAction, type SettingsActionState } from "./actions";

export function HouseNameForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateHouseNameAction, {} as SettingsActionState);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, state.savedName, router]);

  const shownName = state.savedName ?? defaultName;

  return (
    <form action={action} className="space-y-4">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      {state.ok && state.savedName && (
        <p className="text-sm text-brand-cyan">
          Saved as <span className="font-semibold">{state.savedName}</span> — dashboards will greet you by this name.
        </p>
      )}
      <div>
        <Label htmlFor="displayName" className="mb-1.5 block">
          Your name
        </Label>
        <Input
          key={shownName}
          id="displayName"
          name="displayName"
          required
          minLength={2}
          maxLength={80}
          defaultValue={shownName}
          autoComplete="name"
          placeholder="e.g. James"
          className="max-w-md"
        />
        <p className="mt-1 text-xs text-muted-foreground">Shows as “Hi, …” when you sign in to the admin desk.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save my name"}
      </Button>
    </form>
  );
}
