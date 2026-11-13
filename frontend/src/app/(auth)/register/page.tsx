import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/register-form";
import { GoogleSignInLink } from "@/features/auth/google-sign-in-link";
import { AuthBackLink } from "@/components/layout/auth-back-link";

export const metadata: Metadata = { title: { absolute: "Sign up — Up 'n Roll" } };

/** Register reads searchParams for Google error notes — keep request-bound. */
export const instant = false;

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; google?: string }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col">
      <Suspense fallback={<AuthBackLink from={undefined} current="/register" fallback="/login" />}>
        <RegisterChrome searchParams={searchParams} />
      </Suspense>
      <RegisterForm />
      <div className="relative my-5 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-black/15" aria-hidden="true" />
        <span className="relative bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Or
        </span>
      </div>
      <GoogleSignInLink entry="register" />
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
  searchParams: Promise<{ from?: string; google?: string }>;
}) {
  const { from, google } = await searchParams;
  const googleNote =
    google === "unavailable"
      ? "Google sign-in is not set up yet. Use your email."
      : google === "failed"
        ? "Google sign-in did not finish. Use your email."
        : google === "disabled"
          ? "This account is disabled. Contact the organizers."
          : null;

  return (
    <>
      <AuthBackLink from={from} current="/register" fallback="/login" />
      <h1 className="mb-3 mt-2 text-display text-3xl font-semibold">Sign up</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Name, mobile, and email get you an account. The full grappler form opens when you register for an event.
      </p>
      {googleNote && (
        <p className="mb-4 border-2 border-black bg-[#f7f4ef] px-3 py-2 text-sm text-muted-foreground">{googleNote}</p>
      )}
    </>
  );
}
