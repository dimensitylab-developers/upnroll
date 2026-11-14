import "server-only";
import { NextResponse } from "next/server";
import { getStorageAdapter } from "@/server/storage/factory";

/** Buffer small private images for reliable NextResponse delivery (passport / proof photos). */
export async function serveStoredImage(
  key: string,
  options?: { cacheControl?: string }
): Promise<NextResponse> {
  const { data, contentType } = await getStorageAdapter().get(key);
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": options?.cacheControl ?? "private, no-store",
    "Content-Disposition": "inline",
    "Content-Length": String(data.byteLength),
  };
  return new NextResponse(new Uint8Array(data), { headers });
}
