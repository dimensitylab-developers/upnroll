import Link from "next/link";
import { BrandMark, BuiltBy, FounderCredit } from "./brand";

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
    <footer className="border-t border-black/10">
      <div className="max-w-6xl mx-auto pl-4 pr-28 sm:pl-6 lg:pl-8 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2 mr-2">
          <BrandMark className="h-7 w-7" />
          <span className="text-display text-sm font-semibold">Up &apos;n Roll</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-xs text-muted-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-end gap-1 sm:ml-auto">
          <FounderCredit />
          <BuiltBy />
        </div>
      </div>
    </footer>
  );
}
