import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError, ValidationError } from "@/server/http/errors";
import { getFighterForAdmin } from "@/server/services/fighterService";
import { FighterRecord } from "@/features/admin/fighter-record";
import { PageBackLink } from "@/components/layout/page-back-link";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export default async function AdminFighterDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const actor = await requireActor("ADMIN");

  let fighter;
  try {
    fighter = await getFighterForAdmin(actor, userId);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ValidationError) notFound();
    throw err;
  }

  const name = fighter.displayName.trim() || "Unnamed fighter";

  return (
    <div className="space-y-8">
      <PageBackLink href="/admin/fighters" label="Back to fighters" />

      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Registration sheet</p>
        <h1 className="text-display mt-2 text-3xl font-semibold sm:text-4xl">{name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Same sections the fighter fills on profile and event registration — personal, competition, medical, and terms.
        </p>
      </section>

      <FighterRecord fighter={fighter} />
    </div>
  );
}
