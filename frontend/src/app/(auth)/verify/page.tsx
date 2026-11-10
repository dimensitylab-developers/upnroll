import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "@/features/auth/verify-form";

export const metadata: Metadata = { title: { absolute: "Confirm your email — Up 'n Roll" } };

export default function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-2">Confirm your email</h1>
      <Suspense fallback={<VerifyFallback />}>
        <VerifyChrome searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function VerifyFallback() {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">Enter the code from your email.</p>
      <VerifyForm email="" />
    </>
  );
}

async function VerifyChrome({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        {email ? `We sent a code to ${email}.` : "Enter the code from your email."}
      </p>
      <VerifyForm email={email} />
    </>
  );
}
