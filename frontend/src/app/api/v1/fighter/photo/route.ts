import { NextResponse } from "next/server";
import { actorFromSession, getSession } from "@/server/auth/session";
import { getFighterProfile } from "@/server/services/fighterService";
import { getStorageAdapter } from "@/server/storage/local-disk";

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("Sign in to view this photograph.", { status: 401 });

  const actor = actorFromSession(session);
  if (actor.role !== "FIGHTER") {
    return new NextResponse("You do not have access to this resource.", { status: 403 });
  }

  const profile = await getFighterProfile(actor);
  if (!profile?.photoKey) return new NextResponse("No photograph yet.", { status: 404 });

  try {
    const { data, contentType } = await getStorageAdapter().get(profile.photoKey);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Photograph is missing.", { status: 404 });
  }
}
