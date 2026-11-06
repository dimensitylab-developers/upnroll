import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: { absolute: "Register — Up 'n Roll" },
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-display text-3xl font-semibold mb-3">Grappler registration</h1>
      <p className="inline-block bg-brand-red text-white text-display uppercase tracking-wider text-sm px-3 py-1 mb-4 border-2 border-black shadow-[4px_4px_0_0_#000]">
        No-Gi only
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Your name, photograph, belt, and academy stay on your fighter profile. Agree to the terms before the account is created.
      </p>
      <RegisterForm />
      <p className="text-sm text-muted-foreground mt-6 text-center">
        Already registered? <Link href="/login" className="text-primary font-medium">Sign in</Link>
      </p>
    </>
  );
}
