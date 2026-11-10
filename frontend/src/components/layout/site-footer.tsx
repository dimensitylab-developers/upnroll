import Link from "next/link";
import { BuiltBy, FounderCredit } from "./brand";
import type { SiteContact } from "./site-contact";
import { SITE_CONTACT } from "./site-contact";

const EXPLORE = [
  { href: "/events", label: "Events" },
  { href: "/brackets", label: "Brackets" },
  { href: "/rankings", label: "Rankings" },
  { href: "/seminars", label: "Seminars" },
] as const;

const HOUSE = [
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
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
  const hasPhone = Boolean(contact.phoneDisplay && contact.phoneTel);

  return (
    <footer className="border-t-2 border-black bg-[#efeae2]">
      <div className="border-b-2 border-black bg-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-10">
          <div className="max-w-xl">
            <p className="-rotate-1 mb-4 inline-flex border-2 border-black bg-brand-red px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-[3px_3px_0_0_#fff]">
              Up &apos;n Roll · India
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
              Real cards. Public brackets. Built for grapplers who show up.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#fff]"
            >
              <span className="inline-block skew-x-12">@{contact.instagramHandle}</span>
            </a>
            <Link
              href="/events"
              className="inline-flex border-2 border-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Next card
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
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#c8102e]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Instagram</p>
              <p className="text-display mt-2 text-xl font-semibold">@{contact.instagramHandle}</p>
              <p className="mt-1 text-sm text-muted-foreground">DM for cards and day-of questions</p>
            </a>

            <div className="border-2 border-black bg-black p-4 text-white shadow-[5px_5px_0_0_#c8102e]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Venue city</p>
              <p className="text-display mt-2 text-xl font-semibold">{contact.city}</p>
              <p className="mt-1 text-sm text-white/65">No-Gi · Road to Super Fight</p>
              {hasEmail && (
                <a href={`mailto:${contact.email}`} className="mt-3 block text-sm text-white/85 underline">
                  {contact.email}
                </a>
              )}
              {hasPhone && (
                <a href={`tel:${contact.phoneTel}`} className="mt-1 block text-sm text-white/85 underline">
                  {contact.phoneDisplay}
                </a>
              )}
              {!hasEmail && !hasPhone && (
                <p className="mt-3 text-sm text-white/55">DM Instagram for cards and day-of questions.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <FounderCredit />
          <BuiltBy />
        </div>
      </div>
    </footer>
  );
}
