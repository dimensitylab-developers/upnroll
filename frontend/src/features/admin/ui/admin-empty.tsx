export function AdminEmpty({ children }: { children: string }) {
  return (
    <p className="border-2 border-dashed border-black/30 bg-white/60 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
