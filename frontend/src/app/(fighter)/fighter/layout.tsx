import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { FighterNav } from "@/features/fighter/fighter-nav";

export default async function FighterLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "FIGHTER") redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="manga-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3 m-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <span className="text-display font-semibold whitespace-nowrap">Up &apos;n Roll — Fighter</span>
          <FighterNav />
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" type="submit">Sign out</Button>
        </form>
      </header>
      <main className="px-4 pb-10">{children}</main>
    </div>
  );
}
