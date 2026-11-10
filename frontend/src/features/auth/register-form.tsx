"use client";

import { useActionState } from "react";
import { registerAction, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function FieldError({ name, errors }: { name: string; errors?: AuthActionState["fieldErrors"] }) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return <p className="mt-1 text-xs text-primary">{message}</p>;
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="mx-auto w-full max-w-sm space-y-4">
      {state.error && (
        <p className="rounded-sm border border-brand-red/40 bg-brand-red/5 px-3 py-2 text-sm text-primary" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="displayName" className="mb-1.5 block">
          Full name
        </Label>
        <Input id="displayName" name="displayName" autoComplete="name" required className="min-h-11" />
        <FieldError name="displayName" errors={state.fieldErrors} />
      </div>
      <div>
        <Label htmlFor="mobile" className="mb-1.5 block">
          Mobile number
        </Label>
        <Input id="mobile" name="mobile" type="tel" autoComplete="tel" required className="min-h-11" />
        <FieldError name="mobile" errors={state.fieldErrors} />
      </div>
      <div>
        <Label htmlFor="email" className="mb-1.5 block">
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="min-h-11" />
        <FieldError name="email" errors={state.fieldErrors} />
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="min-h-11"
        />
        <p className="mt-1 text-xs text-muted-foreground">At least 10 characters, with a letter and a number.</p>
        <FieldError name="password" errors={state.fieldErrors} />
      </div>
      <Button type="submit" className="min-h-11 w-full" disabled={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
