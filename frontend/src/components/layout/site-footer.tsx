import Link from "next/link";
import { BuiltBy, FounderCredit } from "./brand";

const FOOTER_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/fighters", label: "Fighters" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "FAQ" },
  { href: "/announcements", label: "Announcements" },
  { href: "/policies", label: "Policies" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-display text-lg font-semibold">Up &apos;n Roll</p>
            <p className="text-sm text-muted-foreground mt-1">The Underground Arena.</p>
            <FounderCredit className="mt-3" />
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex justify-end pr-16">
          <BuiltBy />
        </div>
      </div>
    </footer>
  );
}
