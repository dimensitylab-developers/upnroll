import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { FighterNav } from "@/features/fighter/fighter-nav";
import { BrandMark, BuiltBy, FounderCredit } from "@/components/layout/brand";

export default async function FighterLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "FIGHTER") redirect("/login");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="manga-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3 m-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <span className="flex items-center gap-2 text-display font-semibold whitespace-nowrap">
            <BrandMark className="h-8 w-8" />
            Up &apos;n Roll — Fighter
          </span>
          <FighterNav />
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" type="submit">Sign out</Button>
        </form>
      </header>
      <main className="px-4 pb-10 flex-1">{children}</main>
      <div className="px-5 pb-4 flex flex-wrap items-center justify-between gap-3">
        <FounderCredit />
        <BuiltBy />
      </div>
    </div>
  );
}
