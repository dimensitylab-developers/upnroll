"use client";

import { useActionState } from "react";
import { registerAction, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      <div>
        <Label htmlFor="displayName" className="mb-1.5 block">Display name</Label>
        <Input id="displayName" name="displayName" required autoComplete="name" />
        {state.fieldErrors?.displayName && <p className="text-xs text-primary mt-1">{state.fieldErrors.displayName[0]}</p>}
      </div>
      <div>
        <Label htmlFor="email" className="mb-1.5 block">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email && <p className="text-xs text-primary mt-1">{state.fieldErrors.email[0]}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        {state.fieldErrors?.password && <p className="text-xs text-primary mt-1">{state.fieldErrors.password[0]}</p>}
        <p className="text-xs text-muted-foreground mt-1">At least 10 characters, with a letter and a number.</p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
