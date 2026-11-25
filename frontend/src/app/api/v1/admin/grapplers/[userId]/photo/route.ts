import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { fail } from "@/server/http/response";
import { requireObjectId } from "@/server/validation/objectId";
import { serveStoredImage } from "@/server/http/serveStoredImage";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireActor("ADMIN");
    const { userId } = await params;
    requireObjectId(userId, "user");
    await connectDB();
    const profile = await FighterProfile.findOne({ userId }).select("photoKey").lean();
    if (!profile?.photoKey?.trim()) return new NextResponse("No photograph yet.", { status: 404 });
    // Short private cache so roster thumbs are not re-fetched on every navigation.
    return await serveStoredImage(profile.photoKey.trim(), {
      cacheControl: "private, max-age=300",
    });
  } catch (err) {
    return fail(err);
  }
}