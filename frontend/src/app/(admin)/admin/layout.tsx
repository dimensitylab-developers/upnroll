import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { DynamicBoundary } from "@/components/dynamic-boundary";
import { PageLoader } from "@/components/layout/page-loader";
import { getSession } from "@/server/auth/session";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/features/admin/admin-nav";
import { BrandMark, BuiltBy, FounderCredit } from "@/components/layout/brand";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicBoundary fallback={<PageLoader />}>
      <AdminShell>{children}</AdminShell>
    </DynamicBoundary>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  // Request-time boundary for Cache Components — DB/session reads must not prerender.
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");
  // Authenticated non-admins stay signed in — send them to their portal, not login.
  if (session.user.role !== "ADMIN") redirect("/fighter/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="manga-panel m-3 flex flex-col gap-3 px-4 py-3 sm:m-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/admin" className="flex min-h-11 items-center gap-2 text-display text-base font-semibold sm:text-lg">
            <BrandMark className="h-8 w-8 shrink-0" />
            <span className="truncate">Up &apos;n Roll — Admin</span>
          </Link>
          <AdminNav />
        </div>
        <form action={logoutAction} className="sm:shrink-0">
          <Button variant="outline" size="sm" type="submit" className="min-h-11 w-full sm:w-auto">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex-1 px-4 pb-10">{children}</main>
      <div className="flex justify-end px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pr-4">
        <div className="flex flex-col items-end gap-1">
          <FounderCredit />
          <BuiltBy />
        </div>
      </div>
    </div>
  );
}
