import { NextResponse } from "next/server";
import { actorFromSession, getSession } from "@/server/auth/session";
import { getRegistrationForFighter, listMyRegistrations } from "@/server/services/registrationService";
import { openEventPaymentQrForPublic } from "@/server/services/eventService";
import { ForbiddenError, NotFoundError } from "@/server/http/errors";
import { fail } from "@/server/http/response";
import { toWebFileStream } from "@/server/http/streamFile";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const session = await getSession();
    if (!session) throw new ForbiddenError("Sign in required.");
    const { eventId } = await params;
    const actor = actorFromSession(session);

    if (session.user.role === "ADMIN") {
      const { openEventPaymentQr } = await import("@/server/services/eventService");
      const { stream, contentType, length } = await openEventPaymentQr(actor, eventId);
      const headers: Record<string, string> = { "Content-Type": contentType, "Cache-Control": "private, max-age=60" };
      if (Number.isFinite(length) && length >= 0) headers["Content-Length"] = String(length);
      return new NextResponse(toWebFileStream(stream, request.signal), { headers });
    }

    const registrations = await listMyRegistrations(actor);
    const owns = registrations.some((r) => String(r.eventId) === eventId);
    if (!owns) {
      // Also allow when opening via a specific registration id query for safety.
      const registrationId = new URL(request.url).searchParams.get("registrationId");
      if (!registrationId) throw new ForbiddenError("Not allowed.");
      try {
        const data = await getRegistrationForFighter(actor, registrationId);
        if (String(data.event?._id) !== eventId) throw new ForbiddenError("Not allowed.");
      } catch (err) {
        if (err instanceof NotFoundError) throw new ForbiddenError("Not allowed.");
        throw err;
      }
    }

    const { stream, contentType, length } = await openEventPaymentQrForPublic(eventId);
    const headers: Record<string, string> = { "Content-Type": contentType, "Cache-Control": "private, max-age=60" };
    if (Number.isFinite(length) && length >= 0) headers["Content-Length"] = String(length);
    return new NextResponse(toWebFileStream(stream, request.signal), { headers });
  } catch (err) {
    return fail(err);
  }
}
