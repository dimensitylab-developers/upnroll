import { Badge } from "@/components/ui/badge";

export const CHAPTERS = [
  { id: "brand-foundation", label: "01 — Brand Foundation" },
  { id: "design-tokens", label: "02 — Design Tokens" },
  { id: "typography", label: "03 — Typography" },
  { id: "buttons-controls", label: "04 — Buttons & Controls" },
  { id: "navigation-systems", label: "05 — Navigation Systems" },
  { id: "homepage", label: "06 — Public Homepage" },
  { id: "events", label: "07 — Events" },
  { id: "fighter-directory", label: "08 — Fighter Directory" },
  { id: "fighter-profile", label: "09 — Fighter Profile" },
  { id: "registration", label: "10 — Fighter Registration" },
  { id: "qr-payment", label: "11 — QR Payment" },
  { id: "fighter-dashboard", label: "12 — Fighter Dashboard" },
  { id: "brackets", label: "13 — Tournament Brackets" },
  { id: "match-details", label: "14 — Match Details" },
  { id: "rankings", label: "15 — Rankings" },
  { id: "admin-dashboard", label: "16 — Admin Dashboard" },
  { id: "payment-verification", label: "17 — Payment Verification" },
  { id: "requests", label: "18 — Cancellations & Transfers" },
  { id: "notifications", label: "19 — Notifications" },
  { id: "chatbot", label: "20 — Chatbot" },
  { id: "motion-feedback", label: "21 — Motion & Feedback" },
  { id: "responsive", label: "22 — Responsive Behavior" },
] as const;

export function Chapter({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 border-b border-white/10">
      <div className="mb-8 max-w-3xl">
        <span className="text-xs uppercase tracking-widest text-brand-red font-semibold">
          UI Preview Showroom
        </span>
        <h2 className="text-display text-3xl sm:text-4xl font-semibold mt-1">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-3">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function FixtureBadge({ children = "Fictional preview data" }: { children?: React.ReactNode }) {
  return (
    <Badge variant="outline" className="text-muted-foreground border-white/15 mb-4">
      {children}
    </Badge>
  );
}
