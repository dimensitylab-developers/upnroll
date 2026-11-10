"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction, type SettingsActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SiteSettingsForm({
  values,
}: {
  values: {
    instagramHandle: string;
    email: string;
    phoneDisplay: string;
    phoneTel: string;
    city: string;
  };
}) {
  const [state, action, pending] = useActionState(updateSiteSettingsAction, {} as SettingsActionState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="instagramHandle">Instagram</Label>
          <Input id="instagramHandle" name="instagramHandle" defaultValue={values.instagramHandle} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={values.city} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={values.email} placeholder="optional" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phoneDisplay">Phone display</Label>
          <Input id="phoneDisplay" name="phoneDisplay" defaultValue={values.phoneDisplay} placeholder="+91 …" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="phoneTel">Phone link (digits)</Label>
          <Input id="phoneTel" name="phoneTel" defaultValue={values.phoneTel} placeholder="+9177…" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-brand-cyan">Saved. Public footer will pick this up.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save contact settings"}
      </Button>
    </form>
  );
}
