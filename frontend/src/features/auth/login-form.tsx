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
      {state.error && (
        <p className="rounded-sm border border-brand-red/40 bg-brand-red/5 px-3 py-2 text-sm text-primary" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="email" className="mb-1.5 block">
          Email
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="min-h-11" />
        {state.fieldErrors?.email && <p className="mt-1 text-xs text-primary">{state.fieldErrors.email[0]}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-primary">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <Button type="submit" className="min-h-11 w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
