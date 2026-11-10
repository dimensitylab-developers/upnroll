import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { GoogleSignInLink } from "@/features/auth/google-sign-in-link";
import { AuthBackLink } from "@/components/layout/auth-back-link";

export const metadata: Metadata = {
  title: { absolute: "Sign in — Up 'n Roll" },
  robots: { index: false, follow: false },
};

/** Login reads searchParams — keep it request-bound under Cache Components. */
export const instant = false;

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string; from?: string }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <Suspense fallback={<AuthBackLink from={undefined} current="/login" fallback="/" />}>
        <LoginChrome searchParams={searchParams} />
      </Suspense>
      <LoginForm />
      <div className="relative my-5 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-black/15" aria-hidden="true" />
        <span className="relative bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Or
        </span>
      </div>
      <GoogleSignInLink />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register?from=%2Flogin" className="font-semibold text-brand-red underline">
          Register
        </Link>
      </p>
    </div>
  );
}

async function LoginChrome({
  searchParams,
}: {
  searchParams: Promise<{ google?: string; from?: string }>;
}) {
  const { google, from } = await searchParams;
  const googleNote =
    google === "unavailable"
      ? "Google sign-in is not set up yet. Use your email."
      : google === "failed"
        ? "Google sign-in did not finish. Use your email."
        : null;

  return (
    <>
      <AuthBackLink from={from} current="/login" fallback="/" />
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red sm:hidden">Mat gate</p>
      <h1 className="text-display mt-2 mb-2 text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mb-6 text-sm text-muted-foreground">Enter the desk with your house email.</p>
      {googleNote && (
        <p className="mb-4 border-2 border-black bg-[#f7f4ef] px-3 py-2 text-sm text-muted-foreground">{googleNote}</p>
      )}
    </>
  );
}
