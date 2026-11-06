import Link from "next/link";
import { cachedPublicFighters } from "@/lib/public-reads";


export default async function FighterDirectoryPage() {
  const fighters = await cachedPublicFighters();

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">Fighters</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {fighters.map((f) => (
            <Link key={String(f._id)} href={`/fighters/${f.slug}`} className="manga-panel p-4">
              <p className="font-semibold">{f.displayName}</p>
              <p className="text-sm text-muted-foreground">{f.gym || "Independent"}{f.discipline ? ` · ${f.discipline}` : ""}</p>
            </Link>
          ))}
          {fighters.length === 0 && <p className="text-sm text-muted-foreground">No fighters yet.</p>}
        </div>
      </div>
    </main>
  );
}
