import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="manga-panel flex items-center justify-between px-5 py-3 m-4">
        <span className="text-display font-semibold">Up &apos;n Roll — Admin</span>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" type="submit">Sign out</Button>
        </form>
      </header>
      <main className="px-4 pb-10">{children}</main>
    </div>
  );
}
