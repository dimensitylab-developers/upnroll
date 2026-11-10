import type { Metadata } from "next";
import Link from "next/link";
import { requireActor } from "@/server/auth/session";
import { listAllContent } from "@/server/services/contentService";
import { CreateContentForm } from "@/features/content/create-content-form";
import { EditContentForm } from "@/features/content/edit-content-form";
import { PublishToggleButton } from "@/features/content/publish-toggle-button";
import { AdminEmpty } from "@/features/admin/ui/admin-empty";
import { AdminSection } from "@/features/admin/ui/admin-section";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_OPTIONS } from "@/features/content/content-types";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Content" };

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: rawType } = await searchParams;
  const typeFilter = CONTENT_TYPE_OPTIONS.includes(rawType as (typeof CONTENT_TYPE_OPTIONS)[number])
    ? (rawType as (typeof CONTENT_TYPE_OPTIONS)[number])
    : undefined;
  const entries = await listAllContent(await requireActor("ADMIN"), typeFilter);

  return (
    <div className="space-y-10">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">House copy</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">FAQ, announcements, policies</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">Edit published answers the public FAQ and chatbot read.</p>
      </section>

      <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
        <AdminStamp>Create</AdminStamp>
        <CreateContentForm />
      </div>

      <AdminSection title="Library">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href="/admin/content"
            className={`border-2 border-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] ${!typeFilter ? "bg-brand-red text-white" : "bg-white"}`}
          >
            All
          </Link>
          {CONTENT_TYPE_OPTIONS.map((t) => (
            <Link
              key={t}
              href={`/admin/content?type=${t}`}
              className={`border-2 border-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] ${typeFilter === t ? "bg-brand-red text-white" : "bg-white"}`}
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={String(e._id)} className="border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{e.type}</Badge>
                    <Badge variant={e.publicationState === "PUBLISHED" ? "default" : "secondary"}>
                      {e.publicationState}
                    </Badge>
                  </div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{e.body}</p>
                  <EditContentForm entryId={String(e._id)} type={e.type} title={e.title} body={e.body} />
                </div>
                <PublishToggleButton entryId={String(e._id)} currentState={e.publicationState} />
              </div>
            </div>
          ))}
          {entries.length === 0 && <AdminEmpty>No content in this filter yet.</AdminEmpty>}
        </div>
      </AdminSection>
    </div>
  );
}
