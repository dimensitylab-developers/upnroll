import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: { absolute: "Sign up — Up 'n Roll" } };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-3 text-display text-3xl font-semibold">Sign up</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Name, mobile, and email get you an account. The full grappler form opens when you register for an event.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-medium text-primary">Login</Link>
      </p>
    </>
  );
}
