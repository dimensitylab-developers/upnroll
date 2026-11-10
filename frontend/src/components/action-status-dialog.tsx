"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ActionStatusDialogProps = {
  error?: string;
  success?: boolean;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
};

/**
 * Modal feedback for server-action results (profile save, etc.).
 * Opens when error or success flips on; fighter can dismiss and keep editing.
 */
export function ActionStatusDialog({
  error,
  success,
  successTitle = "Saved",
  successMessage = "Your changes were saved.",
  errorTitle = "Something went wrong",
}: ActionStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"error" | "success" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (error) {
      setMode("error");
      setMessage(error);
      setOpen(true);
      return;
    }
    if (success) {
      setMode("success");
      setMessage(successMessage);
      setOpen(true);
    }
  }, [error, success, successMessage]);

  if (!mode) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="border-2 border-black shadow-[8px_8px_0_0_#000] sm:rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-display text-2xl font-semibold">
            {mode === "error" ? errorTitle : successTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="border-2 border-black bg-brand-red text-white shadow-[3px_3px_0_0_#000]">
            {mode === "error" ? "Fix and try again" : "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
