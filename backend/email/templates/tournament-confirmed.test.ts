import { describe, expect, it } from "vitest";
import { EVENT_WHATSAPP_COMMUNITY_URL } from "@/server/content/eventCommunity";
import { tournamentConfirmedEmail } from "./tournament-confirmed";

describe("tournamentConfirmedEmail", () => {
  it("includes the WhatsApp community invite in text and HTML", () => {
    const message = tournamentConfirmedEmail({
      name: "Rohan",
      eventName: "Up 'n Roll No-Gi (#2)",
      division: "Men 65-75 kg · Beginner",
      reference: "409872165310",
    });

    expect(message.body).toContain(EVENT_WHATSAPP_COMMUNITY_URL);
    expect(message.html).toContain(EVENT_WHATSAPP_COMMUNITY_URL);
    expect(message.html).toContain("Join the WhatsApp community");
  });
});
