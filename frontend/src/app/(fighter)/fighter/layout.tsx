import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { DynamicBoundary } from "@/components/dynamic-boundary";
import { PageLoader } from "@/components/layout/page-loader";
import { getSession } from "@/server/auth/session";
import { portalTabTitle, resolveDisplayName } from "@/server/auth/display-name";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { FighterNav } from "@/features/fighter/fighter-nav";
import { BrandMark, BuiltBy, FounderCredit } from "@/components/layout/brand";

/** Fighter portal is cookie/session-bound — never try to instant-prerender it. */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  if (!session || session.user.role !== "FIGHTER") {
    return { robots: { index: false, follow: false }, title: "Fighter" };
  }
  const displayName = await resolveDisplayName(session.user._id, session.user.email);
  const who = portalTabTitle(displayName, "FIGHTER");
  return {
    robots: { index: false, follow: false },
    title: {
      absolute: `${who} · Up 'n Roll`,
      template: `%s · ${who} · Up 'n Roll`,
    },
  };
}

export default function FighterLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicBoundary fallback={<PageLoader />}>
      <FighterShell>{children}</FighterShell>
    </DynamicBoundary>
  );
}

async function FighterShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "FIGHTER") redirect("/admin");

  const displayName = await resolveDisplayName(session.user._id, session.user.email);

  return (
    <div className="flex min-h-dvh flex-col bg-background halftone-bg">
      <header className="sticky top-0 z-40 border-b-2 border-black bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4">
          <Link
            href="/fighter/dashboard"
            className="flex shrink-0 items-center gap-2 text-display text-sm font-semibold"
            aria-label="Fighter home"
          >
            <BrandMark className="h-7 w-7" />
            <span className="hidden sm:inline">Fighter</span>
          </Link>
          <div className="min-w-0 flex-1">
            <FighterNav />
          </div>
          <Link
            href="/"
            className="inline-flex shrink-0 border-2 border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-[2px_2px_0_0_#000] hover:bg-[#f7f4ef] sm:px-2.5"
          >
            <span className="sm:hidden">Site</span>
            <span className="hidden sm:inline">Main site</span>
          </Link>
          <SignOutButton name={displayName} className="h-8 min-h-8 shrink-0 px-2.5 text-xs" />
        </div>
      </header>
      <main className="relative mx-auto w-full max-w-5xl flex-1 px-3 pb-12 pt-4 sm:px-4 sm:pt-5">{children}</main>
      <div className="flex justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
        <div className="flex flex-col items-end gap-1">
          <FounderCredit />
          <BuiltBy />
        </div>
      </div>
    </div>
  );
}
