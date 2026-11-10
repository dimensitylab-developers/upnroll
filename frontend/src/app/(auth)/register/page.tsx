import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/register-form";
import { AuthBackLink } from "@/components/layout/auth-back-link";

export const metadata: Metadata = { title: { absolute: "Sign up — Up 'n Roll" } };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col">
      <Suspense fallback={<AuthBackLink from={undefined} current="/register" fallback="/login" />}>
        <RegisterChrome searchParams={searchParams} />
      </Suspense>
      <h1 className="mb-3 text-display text-3xl font-semibold">Sign up</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Name, mobile, and email get you an account. The full grappler form opens when you register for an event.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login?from=%2Fregister" className="font-medium text-primary">
          Login
        </Link>
      </p>
    </div>
  );
}

async function RegisterChrome({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <AuthBackLink from={from} current="/register" fallback="/login" />;
}
