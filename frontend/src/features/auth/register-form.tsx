"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerAction, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

const fieldClass =
  "min-h-11 border-2 border-black bg-white text-black caret-black shadow-none focus-visible:ring-0 focus-visible:border-brand-red";

function FieldError({ name, errors }: { name: string; errors?: AuthActionState["fieldErrors"] }) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return <p className="mt-1 text-xs text-primary">{message}</p>;
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mx-auto w-full max-w-md space-y-4">
      {state.error && (
        <p className="border-2 border-brand-red bg-brand-red/5 px-3 py-2.5 text-sm text-primary" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="displayName" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em]">
          Full name
        </Label>
        <Input id="displayName" name="displayName" autoComplete="name" required className={fieldClass} />
        <FieldError name="displayName" errors={state.fieldErrors} />
      </div>
      <div>
        <Label htmlFor="mobile" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em]">
          Mobile number
        </Label>
        <Input id="mobile" name="mobile" type="tel" autoComplete="tel" required className={fieldClass} />
        <FieldError name="mobile" errors={state.fieldErrors} />
      </div>
      <div>
        <Label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em]">
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className={fieldClass} />
        <FieldError name="email" errors={state.fieldErrors} />
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em]">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className={`${fieldClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((open) => !open)}
            className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center border-l-2 border-black px-3 text-black hover:bg-[#f3efe8]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">At least 10 characters, with a letter and a number.</p>
        <FieldError name="password" errors={state.fieldErrors} />
      </div>
      <Button
        type="submit"
        className="min-h-12 w-full border-2 border-black bg-brand-red text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_0_#000] hover:bg-brand-red"
        disabled={pending}
      >
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
