import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { getStorageAdapter } from "@/server/storage/local-disk";

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("Sign in to view this photograph.", { status: 401 });

  await connectDB();
  const profile = await FighterProfile.findOne({ userId: session.user._id }).select("photoKey").lean();
  if (!profile?.photoKey) return new NextResponse("No photograph yet.", { status: 404 });

  try {
    const { data, contentType } = await getStorageAdapter().get(profile.photoKey);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Photograph is missing.", { status: 404 });
  }
}
