import { NextResponse } from "next/server";
import { requireRole } from "@/server/auth/session";
import { getPaymentScreenshot } from "@/server/services/paymentService";
import { fail } from "@/server/http/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const { data, contentType } = await getPaymentScreenshot(id);

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
