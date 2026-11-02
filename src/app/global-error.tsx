"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary — catches errors in the root layout itself,
 * so it must render its own <html>/<body> and can't rely on globals.css
 * or any other app-level provider having loaded successfully.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fff", color: "#111" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Up &apos;n Roll hit an unexpected error. Please try again.
            </p>
            <button
              onClick={() => reset()}
              style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
