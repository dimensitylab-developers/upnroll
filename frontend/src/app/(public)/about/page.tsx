import type { Metadata } from "next";
import { FounderCredit } from "@/components/layout/brand";
import { FIGHTING_PHOTOS, HAPPY_PHOTOS } from "@/components/home/site-photos";

export const metadata: Metadata = { title: "About" };

const PHOTOS = [...FIGHTING_PHOTOS.slice(0, 3), ...HAPPY_PHOTOS.slice(0, 3)];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">About</p>
        <h1 className="text-display mt-2 text-5xl font-semibold leading-[0.95]">Earn your role.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          Built for grapplers in India and Brazil. Real fights. Real pay. Real rankings.
        </p>
        <div className="mt-6">
          <FounderCredit />
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((photo) => (
            <li key={photo.src} className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} className="h-auto w-full object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
