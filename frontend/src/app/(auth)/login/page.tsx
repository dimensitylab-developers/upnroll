import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { AuthBackLink } from "@/components/layout/auth-back-link";

export const metadata: Metadata = {
  title: { absolute: "Sign in — Up 'n Roll" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
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
    <div className="mx-auto flex w-full max-w-sm flex-col">
      <AuthBackLink from={from} current="/login" fallback="/" />
      <h1 className="text-display mb-6 text-2xl font-semibold">Sign in</h1>
      {googleNote && <p className="mb-4 text-sm text-muted-foreground">{googleNote}</p>}
      <LoginForm />
      <a
        href="/api/auth/google"
        className="mt-3 flex min-h-11 w-full items-center justify-center border-2 border-black bg-white px-4 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_#000]"
      >
        Continue with Google
      </a>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register?from=%2Flogin" className="font-medium text-primary">
          Register
        </Link>
      </p>
    </div>
  );
}
