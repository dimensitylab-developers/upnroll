import { NextResponse } from "next/server";
import { getPublicFighterPhotoKeyBySlug } from "@/server/services/fighterService";
import { getStorageAdapter } from "@/server/storage/factory";
import { toWebFileStream } from "@/server/http/streamFile";
import { NotFoundError } from "@/server/http/errors";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return new NextResponse("Photograph not found.", { status: 404 });

    const photoKey = await getPublicFighterPhotoKeyBySlug(slug.trim().toLowerCase());
    const { stream, contentType, length } = await getStorageAdapter().open(photoKey);
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Disposition": "inline",
    };
    if (Number.isFinite(length) && length >= 0) {
      headers["Content-Length"] = String(length);
    }

    return new NextResponse(toWebFileStream(stream, request.signal), { headers });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return new NextResponse("Photograph not found.", { status: 404 });
    }
    return new NextResponse("Photograph not found.", { status: 404 });
  }
}
