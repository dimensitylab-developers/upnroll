import { getSession } from "@/server/auth/session";

export default async function AdminOverviewPage() {
  const session = await getSession();

  return (
    <div className="manga-panel p-8 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-2">Phase 2 foundation</p>
      <h1 className="text-display text-2xl font-semibold mb-2">Admin overview</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as {session?.user.email} (role: {session?.user.role}). This confirms
        role-gated access works. Real registration/payment/bracket management is built in
        Phases 3–4 — see <code className="text-xs">docs/architecture/route-map.md</code>.
      </p>
    </div>
  );
}
