import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { openPaymentScreenshot } from "@/server/services/paymentService";
import { fail } from "@/server/http/response";
import { paymentProofHeaders } from "@/features/payments/delivery-headers";
import { toWebFileStream } from "@/server/http/streamFile";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireActor("ADMIN");
    const { id } = await params;
    const { stream, contentType, length } = await openPaymentScreenshot(actor, id);

    const headers = paymentProofHeaders(contentType);
    if (Number.isFinite(length) && length >= 0) {
      headers["Content-Length"] = String(length);
    }

    return new NextResponse(toWebFileStream(stream, request.signal), { headers });
  } catch (err) {
    return fail(err);
  }
}
