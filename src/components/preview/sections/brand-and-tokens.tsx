import { Chapter, FixtureBadge } from "../chapter";
import { Badge } from "@/components/ui/badge";

const palette = [
  { name: "Background", varName: "--background", className: "bg-background border border-white/15" },
  { name: "Card surface", varName: "--card", className: "bg-card border border-white/15" },
  { name: "Foreground (text)", varName: "--foreground", className: "bg-foreground" },
  { name: "Brand red (primary)", varName: "--primary", className: "bg-primary" },
  { name: "Live-state cyan", varName: "--color-brand-cyan", className: "bg-brand-cyan" },
  { name: "Championship gold", varName: "--color-brand-gold", className: "bg-brand-gold" },
  { name: "Muted", varName: "--muted", className: "bg-muted border border-white/10" },
  { name: "Border", varName: "--border", className: "bg-transparent border-2 border-border" },
];

const typeScale = [
  { label: "Display XL", className: "text-display text-5xl font-semibold" },
  { label: "Display L", className: "text-display text-3xl font-semibold" },
  { label: "Heading", className: "text-xl font-semibold" },
  { label: "Body", className: "text-base" },
  { label: "Small / meta", className: "text-sm text-muted-foreground" },
];

const spacingScale = [1, 2, 3, 4, 6, 8, 12, 16];

export function BrandAndTokens() {
  return (
    <>
      <Chapter
        id="brand-foundation"
        title="Brand Foundation"
        subtitle="Up 'n Roll — The Underground Arena. Dark-first editorial combat-sports identity, adapted from the manga-panel/halftone/speed-lines technique audited from the prior project, recolored for a premium fight-night feel rather than a hackathon aesthetic."
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="manga-panel p-6 speed-lines">
            <p className="text-display text-2xl font-semibold mb-1">UP &apos;N ROLL</p>
            <p className="text-sm text-muted-foreground">Wordmark on speed-line texture</p>
          </div>
          <div className="manga-panel p-6 halftone-bg">
            <p className="text-display text-2xl font-semibold mb-1">THE UNDERGROUND ARENA</p>
            <p className="text-sm text-muted-foreground">Tagline on halftone texture</p>
          </div>
          <div className="manga-panel p-6 jagged-edge bg-primary/10">
            <p className="text-display text-2xl font-semibold mb-1 text-primary">FIGHT CARD</p>
            <p className="text-sm text-muted-foreground">Jagged-edge comic panel motif</p>
          </div>
        </div>
        <FixtureBadge>Logo/wordmark shown as styled text — approved brand assets pending (OD-014)</FixtureBadge>
      </Chapter>

      <Chapter
        id="design-tokens"
        title="Design Tokens"
        subtitle="All swatches below render the live CSS custom properties defined in src/app/globals.css — not a separately hardcoded palette."
      >
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {palette.map((p) => (
            <div key={p.varName} className="manga-panel p-0 overflow-hidden">
              <div className={`h-20 ${p.className}`} />
              <div className="p-3">
                <p className="text-sm font-medium">{p.name}</p>
                <code className="text-xs text-muted-foreground">{p.varName}</code>
              </div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Type scale</h3>
            <div className="space-y-2">
              {typeScale.map((t) => (
                <p key={t.label} className={t.className}>{t.label} — Up &apos;n Roll</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Spacing scale (Tailwind units)</h3>
            <div className="flex flex-wrap items-end gap-2">
              {spacingScale.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div className="bg-primary/70" style={{ width: `${s * 4}px`, height: `${s * 4}px` }} />
                  <span className="text-xs text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 mt-6">Radius / shadow</h3>
            <div className="flex gap-3">
              <div className="size-16 bg-card border border-white/15 rounded-sm flex items-center justify-center text-xs">sm</div>
              <div className="size-16 bg-card border border-white/15 rounded-md flex items-center justify-center text-xs">md</div>
              <div className="size-16 bg-card border border-white/15 rounded-lg flex items-center justify-center text-xs">lg</div>
              <div className="size-16 bg-card manga-panel flex items-center justify-center text-xs">panel</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Badge>Division: Lightweight</Badge>
          <Badge variant="secondary">Status: Scheduled</Badge>
          <Badge variant="outline">Discipline: Grappling</Badge>
          <Badge variant="destructive">Payment: Rejected</Badge>
        </div>
      </Chapter>
    </>
  );
}
