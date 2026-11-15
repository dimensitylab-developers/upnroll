import { NextResponse } from "next/server";
import { getPublicFighterPhotoKeyBySlug } from "@/server/services/fighterService";
import { serveStoredImage } from "@/server/http/serveStoredImage";
import { fail } from "@/server/http/response";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return new NextResponse("Photograph not found.", { status: 404 });

    const photoKey = await getPublicFighterPhotoKeyBySlug(slug.trim().toLowerCase());
    return await serveStoredImage(photoKey, {
      cacheControl: "public, max-age=300, stale-while-revalidate=3600",
    });
  } catch (err) {
    return fail(err);
  }
}