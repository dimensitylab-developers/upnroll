import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background halftone-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-display text-2xl font-semibold mb-6">
          Up &apos;n Roll
        </Link>
        <div className="manga-panel p-8">{children}</div>
      </div>
    </main>
  );
}
