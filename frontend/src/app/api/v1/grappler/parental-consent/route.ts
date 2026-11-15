import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { getFighterProfile } from "@/server/services/fighterService";
import { getStorageAdapter } from "@/server/storage/factory";
import { toWebFileStream } from "@/server/http/streamFile";

export async function GET(request: Request) {
  try {
    const actor = await requireActor("GRAPPLER");
    const profile = await getFighterProfile(actor);
    if (!profile?.parentalConsentImageKey) {
      return new NextResponse("No parental consent image yet.", { status: 404 });
    }

    const { stream, contentType, length } = await getStorageAdapter().open(profile.parentalConsentImageKey);
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
    return new NextResponse("Parental consent image is missing.", { status: 404 });
  }
}