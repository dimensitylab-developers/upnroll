"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareFighterCardButton({
  slug,
  displayName,
  className,
}: {
  slug: string;
  displayName: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/fighters/${slug}`;
    const title = `${displayName} · Up 'n Roll`;
    const text = `Check ${displayName}'s card on Up 'n Roll.`;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      // Fall through to clipboard if share is cancelled or unavailable.
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures — user can still open the public page.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={
        className ??
        "inline-flex min-h-10 items-center gap-2 border-2 border-black bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#000] hover:bg-[#f7f4ef]"
      }
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? "Link copied" : "Share card"}
    </button>
  );
}
