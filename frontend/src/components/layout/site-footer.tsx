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
    <p className="mb-4 inline-flex rounded-full border border-white/20 bg-brand-red/90 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-12px_rgba(200,16,46,0.9)] backdrop-blur-md">
      {children}
    </p>
  );
}

export function SiteFooter({ contact = SITE_CONTACT }: { contact?: SiteContact }) {
  const hasEmail = Boolean(contact.email);

  return (
    <footer className="relative overflow-hidden text-white">
      {/* Soft dark field + glow — not a flat black slab */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_-10%,rgba(200,16,46,0.35),transparent_55%),radial-gradient(90%_70%_at_90%_20%,rgba(255,255,255,0.08),transparent_50%),linear-gradient(180deg,#0a0a0a_0%,#141414_55%,#0b0b0b_100%)]" />
      <div
        className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-brand-red/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[2rem] border border-white/20 bg-white/[0.08] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_24px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-8 lg:rounded-[2.5rem] lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] lg:gap-12">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
                Up &apos;n Roll
              </p>
              <Link
                href="/"
                aria-label="Up 'n Roll home"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/95 px-3 py-2.5 shadow-[0_12px_40px_-18px_rgba(200,16,46,0.75)] transition-transform hover:-translate-y-0.5 sm:gap-4 sm:rounded-3xl sm:px-4 sm:py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.png" alt="" className="h-11 w-auto object-contain sm:h-12" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-11 w-auto sm:h-12" />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
                Made by an athlete for an athlete. Real fights. Real pay. Real rankings.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              <div>
                <FooterHeading>Explore</FooterHeading>
                <ul className="space-y-1.5">
                  {EXPLORE.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex rounded-full px-2.5 py-1 text-sm font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <FooterHeading>More</FooterHeading>
                <ul className="space-y-1.5">
                  {HOUSE.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex rounded-full px-2.5 py-1 text-sm font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white"
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
                  className="block rounded-3xl border border-white/25 bg-white/95 p-4 text-black shadow-[0_16px_48px_-24px_rgba(200,16,46,0.7)] backdrop-blur-md transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Instagram</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold sm:text-lg">
                    <Instagram className="h-5 w-5 shrink-0 text-brand-red" aria-hidden="true" strokeWidth={2.25} />
                    <span>@{contact.instagramHandle}</span>
                  </p>
                  {hasEmail && <p className="mt-2 text-sm text-neutral-600">{contact.email}</p>}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t-2 border-black bg-white text-foreground">
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
