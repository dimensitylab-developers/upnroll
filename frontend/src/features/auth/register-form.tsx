"use client";

import { useActionState } from "react";
import { registerAction, type AuthActionState } from "./actions";
import { GrapplerForm } from "@/features/fighters/grappler-form";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return <GrapplerForm mode="register" state={state} formAction={formAction} pending={pending} />;
}
