"use client";

import { useActionState } from "react";
import { judgeLoginAction, type JudgeActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: JudgeActionState = {};

export function JudgeLoginForm() {
  const [state, action, pending] = useActionState(judgeLoginAction, initial);

  return (
    <form action={action} className="space-y-5 border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#c8102e] sm:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Match scoring</p>
        <h1 className="text-display mt-2 text-2xl font-semibold">Judge sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the one-time username and password issued for this match. This is a shared scoring console, not a personal account.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required className="border-2 border-black" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-2 border-black"
        />
      </div>

      {state.error && (
        <p className="border-2 border-black bg-brand-red/10 px-3 py-2 text-sm text-foreground" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full border-2 border-black bg-black text-white shadow-[4px_4px_0_0_#c8102e] hover:bg-brand-red"
      >
        {pending ? "Signing in…" : "Enter scoring console"}
      </Button>
    </form>
  );
}
