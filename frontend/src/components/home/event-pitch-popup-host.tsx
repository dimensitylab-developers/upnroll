import { connection } from "next/server";
import { getSession } from "@/server/auth/session";
import { EventPitchPopup } from "./event-pitch-popup";

/** Server wrapper so the pitch popup auth CTA matches session (Dashboard vs Sign up). */
export async function EventPitchPopupHost() {
  await connection();
  const session = await getSession();
  const authHref = session
    ? session.user.role === "ADMIN"
      ? "/admin"
      : "/grappler/dashboard"
    : "/register";
  const authLabel = session ? "Dashboard" : "Sign up";

  return <EventPitchPopup authHref={authHref} authLabel={authLabel} />;
}
