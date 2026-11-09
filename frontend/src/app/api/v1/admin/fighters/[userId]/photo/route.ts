import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { getStorageAdapter } from "@/server/storage/factory";
import { fail } from "@/server/http/response";
import { requireObjectId } from "@/server/validation/objectId";
import { toWebFileStream } from "@/server/http/streamFile";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireActor("ADMIN");
    const { userId } = await params;
    requireObjectId(userId, "user");
    await connectDB();
    const profile = await FighterProfile.findOne({ userId }).select("photoKey").lean();
    if (!profile?.photoKey) return new NextResponse("No photograph yet.", { status: 404 });

    const { stream, contentType, length } = await getStorageAdapter().open(profile.photoKey);
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    };
    if (Number.isFinite(length) && length >= 0) {
      headers["Content-Length"] = String(length);
    }

    return new NextResponse(toWebFileStream(stream, request.signal), { headers });
  } catch (err) {
    return fail(err);
  }
}
