import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: { absolute: "Sign in — Up 'n Roll" } };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-display text-2xl font-semibold mb-6">Sign in</h1>
      <LoginForm />
      <p className="text-sm text-muted-foreground mt-6 text-center">
        No account? <Link href="/register" className="text-primary font-medium">Register</Link>
      </p>
    </>
  );
}
