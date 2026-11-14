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
      <div className="border-b-2 border-black bg-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-10">
          <div className="max-w-xl">
            <p className="-rotate-1 mb-4 inline-flex border-2 border-black bg-brand-red px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-[3px_3px_0_0_#fff]">
              Up &apos;n Roll · D3 Spectator
            </p>
            <Link
              href="/"
              aria-label="Up 'n Roll home"
              className="inline-flex items-center gap-4 border-2 border-black bg-white px-4 py-3 shadow-[8px_8px_0_0_#c8102e] transition-transform hover:-translate-y-0.5 hover:shadow-[10px_10px_0_0_#c8102e]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="" className="h-12 w-auto object-contain sm:h-14" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-12 w-auto sm:h-14" />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
              Made by an athlete for an athlete. Real fights. Real pay. Real rankings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex -skew-x-12 items-center border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#fff]"
            >
              <span className="inline-flex skew-x-12 items-center gap-2">
                <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={2.25} />
                @{contact.instagramHandle}
              </span>
            </a>
            <Link
              href="/events"
              className="inline-flex border-2 border-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Next event
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8 lg:py-12">
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

        <div className="sm:col-span-2 lg:col-span-2">
          <FooterHeading>Contact</FooterHeading>
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="block max-w-md border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#c8102e]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Instagram</p>
            <p className="text-display mt-2 inline-flex items-center gap-2.5 text-xl font-semibold">
              <Instagram className="h-6 w-6 shrink-0 text-brand-red" aria-hidden="true" strokeWidth={2.25} />
              <span>@{contact.instagramHandle}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">DM for queries</p>
            {hasEmail && (
              <p className="mt-2 text-sm text-muted-foreground">{contact.email}</p>
            )}
          </a>
        </div>
      </div>

      <div className="border-t-2 border-black bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-3 px-4 py-4 text-center sm:grid-cols-3 sm:gap-4 sm:px-6 sm:text-left lg:px-8">
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <SiteCopyright />
            <FounderCredit />
          </div>
          <div className="flex justify-center sm:justify-center">
            <FooterAddress />
          </div>
          <div className="flex justify-center sm:justify-end">
            <BuiltBy />
          </div>
        </div>
      </div>
    </footer>
  );
}
