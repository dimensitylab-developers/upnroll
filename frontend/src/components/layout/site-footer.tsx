import Link from "next/link";
import { Instagram } from "lucide-react";
import { BuiltBy, FooterAddress, FounderCredit, SiteCopyright } from "./brand";
import type { SiteContact } from "./site-contact";
import { SITE_CONTACT } from "./site-contact";

const EXPLORE = [
  { href: "/about", label: "About Us" },
  { href: "/events", label: "Events" },
  { href: "/brackets", label: "Brackets" },
  { href: "/rankings", label: "Rankings" },
] as const;

const HOUSE = [
  { href: "/faq", label: "FAQ" },
  { href: "/seminars", label: "Seminars" },
  { href: "/store", label: "Store" },
  { href: "/announcements", label: "Announcements" },
  { href: "/policies", label: "Policies" },
] as const;

function FooterHeading({ children }: { children: string }) {
  return (
    <p className="mb-4 inline-flex -skew-x-12 items-stretch shadow-[4px_4px_0_0_#000]">
      <span className="w-2.5 bg-black" aria-hidden="true" />
      <span className="bg-brand-red px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
        <span className="inline-block skew-x-12">{children}</span>
      </span>
    </p>
  );
}

export function SiteFooter({ contact = SITE_CONTACT }: { contact?: SiteContact }) {
  const hasEmail = Boolean(contact.email);

  return (
    <footer className="border-t-2 border-black bg-[#efeae2]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] lg:gap-12">
          <div>
            <p className="-rotate-1 mb-4 inline-flex border-2 border-black bg-brand-red px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-[3px_3px_0_0_#000]">
              Up &apos;n Roll · D3 Spectator
            </p>
            <Link
              href="/"
              aria-label="Up 'n Roll home"
              className="inline-flex items-center gap-3 border-2 border-black bg-white px-3 py-2.5 shadow-[6px_6px_0_0_#c8102e] transition-transform hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#c8102e] sm:gap-4 sm:px-4 sm:py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="" className="h-11 w-auto object-contain sm:h-12" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-11 w-auto sm:h-12" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-foreground/80">
              Made by an athlete for an athlete. Real fights. Real pay. Real rankings.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <div>
              <FooterHeading>Explore</FooterHeading>
              <ul className="space-y-2">
                {EXPLORE.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block border-2 border-transparent px-1 text-sm font-semibold hover:border-black hover:bg-white hover:shadow-[3px_3px_0_0_#000]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterHeading>The house</FooterHeading>
              <ul className="space-y-2">
                {HOUSE.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block border-2 border-transparent px-1 text-sm font-semibold hover:border-black hover:bg-white hover:shadow-[3px_3px_0_0_#000]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <FooterHeading>Contact</FooterHeading>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="block border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#c8102e]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Instagram</p>
                <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold sm:text-lg">
                  <Instagram className="h-5 w-5 shrink-0 text-brand-red" aria-hidden="true" strokeWidth={2.25} />
                  <span>@{contact.instagramHandle}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">DM for queries</p>
                {hasEmail && (
                  <p className="mt-2 text-sm text-muted-foreground">{contact.email}</p>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-4 py-4 text-center sm:grid-cols-3 sm:gap-4 sm:px-6 sm:text-left lg:px-8">
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <SiteCopyright />
            <FounderCredit />
          </div>
          <FooterAddress />
          <div className="flex justify-center sm:justify-end">
            <BuiltBy />
          </div>
        </div>
      </div>
    </footer>
  );
}
