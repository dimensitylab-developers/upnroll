import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireActor } from "@/server/auth/session";
import { listFightersForAdmin } from "@/server/services/fighterService";
import { FightersSearch } from "@/features/admin/fighters-search";
import { AdminEmpty } from "@/features/admin/ui/admin-empty";

/** Session/DB-bound route  allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Grapplers" };

export default async function AdminFightersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const { fighters: filtered, total, totalPages } = await listFightersForAdmin(await requireActor("ADMIN"), {
    search: q,
    page,
  });

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Roster</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">Grapplers</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Open a name to read the full registration sheet  personal, competition, medical, and terms.
        </p>
        <p className="mt-4 text-display text-4xl font-semibold text-brand-red">{total}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">on the books</p>
      </section>

      <Suspense fallback={null}>
        <FightersSearch defaultValue={q} />
      </Suspense>

      <div className="space-y-3">
        {filtered.map((fighter) => {
          const name = fighter.displayName.trim() || "Unnamed grappler";
          const meta = [fighter.academy, fighter.cityState, fighter.weightDivision].filter((part) => part.trim()).join(" · ");
          return (
            <Link
              key={fighter.userId}
              href={`/admin/grapplers/${fighter.userId}`}
              className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#c8102e] sm:gap-4 sm:p-4"
            >
              <div className="aspect-[3/4] w-full overflow-hidden border-2 border-black bg-[#efeae2] flex items-center justify-center">
                {fighter.hasPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/v1/admin/grapplers/${fighter.userId}/photo`}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground">No photo</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Full name (as per ID)</p>
                <p className="text-display truncate text-xl font-semibold sm:text-2xl">{name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{fighter.email || "No email"}</p>
                {meta ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p> : null}
              </div>
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-brand-red sm:inline">Open sheet →</span>
            </Link>
          );
        })}
        {filtered.length === 0 && <AdminEmpty>No grapplers match that search.</AdminEmpty>}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3 border-t-2 border-black pt-4" aria-label="Pagination">
          <Link
            href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.max(1, page - 1)) }).toString()}`}
            aria-disabled={page <= 1}
            className={`border-2 border-black bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:-translate-y-0.5"
            }`}
          >
            ← Prev
          </Link>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <Link
            href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.min(totalPages, page + 1)) }).toString()}`}
            aria-disabled={page >= totalPages}
            className={`border-2 border-black bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] ${
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:-translate-y-0.5"
            }`}
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  );
}