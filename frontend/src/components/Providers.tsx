"use client";

import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RedCursor } from "@/components/red-cursor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster theme="light" />
      <RedCursor />
      {children}
    </TooltipProvider>
  );
}
