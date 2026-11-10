import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { DynamicBoundary } from "@/components/dynamic-boundary";
import { PageLoader } from "@/components/layout/page-loader";
import { getSession } from "@/server/auth/session";
import { portalGreeting, portalTabTitle, resolveDisplayName } from "@/server/auth/display-name";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { AdminNav } from "@/features/admin/admin-nav";
import { BrandMark, BuiltBy, FounderCredit } from "@/components/layout/brand";

/** Admin is cookie/session-bound — never try to instant-prerender the portal. */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { robots: { index: false, follow: false }, title: "Admin" };
  }
  const displayName = await resolveDisplayName(session.user._id, session.user.email);
  const who = portalTabTitle(displayName, "ADMIN");
  return {
    robots: { index: false, follow: false },
    title: {
      absolute: `${who} · Up 'n Roll`,
      template: `%s · ${who} · Up 'n Roll`,
    },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicBoundary fallback={<PageLoader />}>
      <AdminShell>{children}</AdminShell>
    </DynamicBoundary>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/fighter/dashboard");

  const displayName = await resolveDisplayName(session.user._id, session.user.email);
  const greeting = portalGreeting(displayName, "ADMIN");

  return (
    <div className="flex min-h-dvh flex-col bg-[#efeae2]">
      <header className="sticky top-0 z-40 border-b-2 border-black bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <Link href="/admin" className="flex min-h-11 min-w-0 items-center gap-2 sm:gap-3">
              <span className="shrink-0 border-2 border-white bg-white p-1.5 shadow-[4px_4px_0_0_#c8102e]">
                <BrandMark className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">House control</span>
                <span className="text-display block truncate text-base font-semibold sm:text-lg lg:text-xl">
                  <span className="sm:hidden">Admin</span>
                  <span className="hidden sm:inline">Up &apos;n Roll Admin</span>
                </span>
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-white">{greeting}</p>
                <p className="max-w-[14rem] truncate text-xs text-white/50">{session.user.email}</p>
              </div>
              <SignOutButton
                name={displayName}
                className="min-h-10 border-white bg-transparent px-3 text-white hover:bg-white hover:text-black sm:min-h-11"
              />
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      <div className="border-t-2 border-black bg-white">
        <div className="mx-auto flex max-w-6xl justify-end gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-end gap-1">
            <FounderCredit />
            <BuiltBy />
          </div>
        </div>
      </div>
    </div>
  );
}
