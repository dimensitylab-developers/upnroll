import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: { absolute: "Sign in — Up 'n Roll" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const { google } = await searchParams;
  const googleNote =
    google === "unavailable"
      ? "Google sign-in is not set up yet. Use your email."
      : google === "failed"
        ? "Google sign-in did not finish. Use your email."
        : null;

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-6">Sign in</h1>
      {googleNote && <p className="text-sm text-muted-foreground mb-4">{googleNote}</p>}
      <LoginForm />
      <a
        href="/api/auth/google"
        className="mt-3 flex w-full items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_0_#000]"
      >
        Continue with Google
      </a>
      <p className="text-sm text-muted-foreground mt-6 text-center">
        No account? <Link href="/register" className="text-primary font-medium">Register</Link>
      </p>
    </div>
  );
}
