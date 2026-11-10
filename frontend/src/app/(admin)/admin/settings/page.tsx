import type { Metadata } from "next";
import { requireActor, requireSession } from "@/server/auth/session";
import { resolveDisplayName } from "@/server/auth/display-name";
import { getSiteSettingsForAdmin } from "@/server/services/siteSettingsService";
import { SiteSettingsForm } from "@/features/settings/site-settings-form";
import { HouseNameForm } from "@/features/settings/house-name-form";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await requireSession();
  const actor = await requireActor("ADMIN");
  const [settings, displayName] = await Promise.all([
    getSiteSettingsForAdmin(actor),
    resolveDisplayName(session.user._id, session.user.email),
  ]);

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Site settings</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">Contact the house</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Set your own name for admin greetings, then the public footer contact details.
        </p>
      </section>

      <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-8">
        <AdminStamp>Your house name</AdminStamp>
        <p className="mb-4 mt-3 text-sm text-muted-foreground">
          This is how the desk greets you — “Hi, …” on sign-in and “Sign out, …” when you leave.
        </p>
        <HouseNameForm defaultName={displayName} />
      </div>

      <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-8">
        <AdminStamp>Public contact</AdminStamp>
        <SiteSettingsForm values={settings} />
      </div>
    </div>
  );
}
