import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Register — Up 'n Roll" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-display text-2xl font-semibold mb-6">Create your fighter account</h1>
      <RegisterForm />
      <p className="text-sm text-muted-foreground mt-6 text-center">
        Already registered? <Link href="/login" className="text-primary font-medium">Sign in</Link>
      </p>
    </>
  );
}
