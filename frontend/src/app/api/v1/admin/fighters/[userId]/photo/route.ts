import { NextResponse } from "next/server";
import { requireRole } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { getStorageAdapter } from "@/server/storage/factory";
import { fail } from "@/server/http/response";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { userId } = await params;
    await connectDB();
    const profile = await FighterProfile.findOne({ userId }).select("photoKey").lean();
    if (!profile?.photoKey) return new NextResponse("No photograph yet.", { status: 404 });

    const { data, contentType } = await getStorageAdapter().get(profile.photoKey);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return fail(err);
  }
}
