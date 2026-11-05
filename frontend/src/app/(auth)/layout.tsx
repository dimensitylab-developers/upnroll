import Link from "next/link";
import { BrandMark, BuiltBy, FounderCredit } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background halftone-bg flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <BrandMark className="h-10 w-10" />
          <span className="text-display text-2xl font-semibold">Up &apos;n Roll</span>
        </Link>
        <div className="manga-panel p-8">{children}</div>
        <FounderCredit className="justify-center mt-6 w-full" />
        <BuiltBy className="text-center mt-2 w-full" />
      </div>
    </main>
  );
}
