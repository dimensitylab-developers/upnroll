"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Route-segment error boundary (Next.js convention). Catches rendering/
 * data errors below the root layout and shows a safe, branded fallback
 * instead of a raw stack trace. Real error tracking (Sentry etc.) is an
 * OD-012-class infra decision, not wired here — this only logs to the
 * server console for now.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="manga-panel p-8 max-w-md text-center">
        <h1 className="text-display text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          An unexpected error occurred. You can try again, or go back to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => reset()}>Try again</Button>
          <Button asChild><Link href="/">Go home</Link></Button>
        </div>
      </div>
    </div>
  );
}
