"use client";

import { useState } from "react";

/**
 * Public fighter passport photo with initials fallback when the asset 404s
 * (stale photoKey / missing GridFS file). Avoids noisy console image errors.
 */
export function FighterPhoto({
  slug,
  displayName,
  className,
  width,
  height,
  loading = "lazy",
  fetchPriority,
}: {
  slug: string;
  displayName: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const [failed, setFailed] = useState(false);
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className ?? ""}`}>
        <span className="text-display text-xl font-semibold text-black/25 sm:text-2xl">
          {initials || "UR"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/v1/public/fighters/${slug}/photo`}
      alt=""
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
