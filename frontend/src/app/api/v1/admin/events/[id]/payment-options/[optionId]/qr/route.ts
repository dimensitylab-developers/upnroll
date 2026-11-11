import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { openPaymentOptionQr } from "@/server/services/paymentOptionService";
import { fail } from "@/server/http/response";
import { toWebFileStream } from "@/server/http/streamFile";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; optionId: string }> }) {
  try {
    await requireActor("ADMIN");
    const { id, optionId } = await params;
    const { stream, contentType, length } = await openPaymentOptionQr(id, optionId);
    const headers: Record<string, string> = { "Content-Type": contentType, "Cache-Control": "private, max-age=60" };
    if (Number.isFinite(length) && length >= 0) headers["Content-Length"] = String(length);
    return new NextResponse(toWebFileStream(stream, request.signal), { headers });
  } catch (err) {
    return fail(err);
  }
}
