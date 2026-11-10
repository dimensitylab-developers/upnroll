"use client";

import { Suspense, type ReactNode } from "react";

export function DynamicBoundary({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
