import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { getFighterProfile } from "@/server/services/fighterService";
import { getStorageAdapter } from "@/server/storage/factory";
import { toWebFileStream } from "@/server/http/streamFile";

export async function GET(request: Request) {
  try {
    const actor = await requireActor("FIGHTER");
    const profile = await getFighterProfile(actor);
    if (!profile?.aadhaarImageKey) return new NextResponse("No Aadhaar image yet.", { status: 404 });

    const { stream, contentType, length } = await getStorageAdapter().open(profile.aadhaarImageKey);
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
    };
    if (Number.isFinite(length) && length >= 0) {
      headers["Content-Length"] = String(length);
    }

    return new NextResponse(toWebFileStream(stream, request.signal), { headers });
  } catch {
    return new NextResponse("Aadhaar image is missing.", { status: 404 });
  }
}
