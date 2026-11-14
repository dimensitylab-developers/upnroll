import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { getFighterProfile } from "@/server/services/fighterService";
import { serveStoredImage } from "@/server/http/serveStoredImage";
import { fail } from "@/server/http/response";
import { NotFoundError } from "@/server/http/errors";

export async function GET() {
  try {
    const actor = await requireActor("FIGHTER");
    const profile = await getFighterProfile(actor);
    if (!profile?.photoKey?.trim()) throw new NotFoundError("No photograph yet.");
    return await serveStoredImage(profile.photoKey.trim());
  } catch (err) {
    return fail(err);
  }
}
