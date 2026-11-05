import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./brand";
import { MobileNavToggle } from "./mobile-nav-toggle";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/fighters", label: "Fighters" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "FAQ" },
];

export async function SiteHeader() {
  const session = await getSession();
  const dashboardHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/fighter/dashboard") : null;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-black/10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BrandMark />
            <span className="text-display text-xl font-semibold">Up &apos;n Roll</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {dashboardHref ? (
              <Button asChild size="sm"><Link href={dashboardHref}>Dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
                <Button asChild size="sm"><Link href="/register">Register</Link></Button>
              </>
            )}
          </div>

          <MobileNavToggle links={NAV_LINKS} dashboardHref={dashboardHref} />
        </div>
      </div>
    </header>
  );
}
