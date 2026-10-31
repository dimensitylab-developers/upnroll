"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      <div>
        <Label htmlFor="email" className="mb-1.5 block">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email && <p className="text-xs text-primary mt-1">{state.fieldErrors.email[0]}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
        {state.fieldErrors?.password && <p className="text-xs text-primary mt-1">{state.fieldErrors.password[0]}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
