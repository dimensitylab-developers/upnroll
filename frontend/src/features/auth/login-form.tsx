"use client";

import { useActionState, useCallback, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, type AuthActionState } from "./actions";
import { AuthTransitionOverlay, guessNameFromEmail, holdAuthGate } from "./auth-transition-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

const fieldClass =
  "min-h-11 border-2 border-black bg-white text-black caret-black shadow-none focus-visible:ring-0 focus-visible:border-brand-red";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gating, setGating] = useState(false);
  const gateName = guessNameFromEmail(email);

  const gatedLogin = useCallback(async (prev: AuthActionState, formData: FormData) => {
    setGating(true);
    // Hold the mat gate so “Hi, {name}” is readable, then finish auth.
    await holdAuthGate();
    try {
      const result = await loginAction(prev, formData);
      // Successful login redirects (throws). If we got a result, stay on the form.
      setGating(false);
      return result;
    } catch (err) {
      // NEXT_REDIRECT also throws — leave the gate up through navigation.
      throw err;
    }
  }, []);

  const [state, formAction, pending] = useActionState(gatedLogin, initialState);
  const showGate = gating || pending;

  return (
    <>
      {showGate ? <AuthTransitionOverlay mode="in" name={gateName} /> : null}
      <form action={formAction} className="space-y-5" onSubmit={() => setGating(true)}>
        {state.error && (
          <p className="border-2 border-brand-red bg-brand-red/5 px-3 py-2.5 text-sm text-primary" role="alert">
            {state.error}
          </p>
        )}
        <div>
          <Label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={fieldClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {state.fieldErrors?.email && <p className="mt-1 text-xs text-primary">{state.fieldErrors.email[0]}</p>}
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
              required
              autoComplete="current-password"
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
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-primary">{state.fieldErrors.password[0]}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={showGate}
          className="min-h-12 w-full border-2 border-black bg-brand-red text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_0_#000] hover:bg-brand-red"
        >
          {showGate ? "Stepping on the mat…" : "Sign in"}
        </Button>
      </form>
    </>
  );
}
