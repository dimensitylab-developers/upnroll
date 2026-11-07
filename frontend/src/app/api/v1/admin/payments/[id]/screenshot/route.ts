import { NextResponse } from "next/server";
import { requireActor } from "@/server/auth/session";
import { getPaymentScreenshot } from "@/server/services/paymentService";
import { fail } from "@/server/http/response";
import { paymentProofHeaders } from "@/features/payments/delivery-headers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireActor("ADMIN");
    const { id } = await params;
    const { data, contentType } = await getPaymentScreenshot(actor, id);

    return new NextResponse(new Uint8Array(data), {
      headers: paymentProofHeaders(contentType),
    });
  } catch (err) {
    return fail(err);
  }
}
