import Link from "next/link";
import { BrandMark, BuiltBy, FounderCredit } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background halftone-bg flex justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-10">
      <div className="w-full max-w-lg sm:max-w-4xl">
        <Link
          href="/"
          className="mb-5 flex min-h-11 items-center justify-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <BrandMark className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="text-display text-xl font-semibold sm:text-2xl">Up &apos;n Roll</span>
        </Link>
        <div className="manga-panel p-5 sm:p-8">{children}</div>
        <FounderCredit className="justify-center mt-6 w-full" />
        <BuiltBy className="text-center mt-2 w-full" />
      </div>
    </main>
  );
}
