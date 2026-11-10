import { NextResponse } from "next/server";
import { connectDB } from "@/server/db/connect";
import { Event } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { invalidatePublicTags } from "@/lib/public-tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One-shot production align. Remove after use. */
const OPS_TOKEN = "upnroll-align-public-card-2026-11-10";
const SERIES_SLUG = "up-n-roll-superfight-series";
const QA_NAME = /phase\s*3\s*qa|qa\s*trials|e2e\s*flow\s*arena/i;

const DIVISIONS = [
  "Men Beginner −65 kg",
  "Men Intermediate −75 kg",
  "Women Open",
];

export async function POST(req: Request) {
  const token = req.headers.get("x-ops-token")?.trim() ?? "";
  if (token !== OPS_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const qaEvents = await Event.find({
    $or: [{ name: QA_NAME }, { slug: /e2e-flow-arena|phase-3-qa|qa-trials/i }],
  }).lean();

  const demoted = [];
  for (const event of qaEvents) {
    await Event.updateOne({ _id: event._id }, { $set: { status: "DRAFT" } });
    demoted.push({ id: String(event._id), name: event.name, slug: event.slug });
  }

  // Any other non-series REGISTRATION_OPEN cards drop to DRAFT so the header can't pick them.
  const otherOpen = await Event.find({
    status: "REGISTRATION_OPEN",
    slug: { $ne: SERIES_SLUG },
  }).lean();
  for (const event of otherOpen) {
    await Event.updateOne({ _id: event._id }, { $set: { status: "DRAFT" } });
    demoted.push({ id: String(event._id), name: event.name, slug: event.slug, reason: "other-open" });
  }

  const series = await Event.findOneAndUpdate(
    { slug: SERIES_SLUG },
    {
      $set: {
        name: "Up 'n Roll Superfight Series",
        slug: SERIES_SLUG,
        description: "Road to Super Fight.",
        venue: "Up 'n Roll mats",
        startDate: new Date("2027-01-23T10:00:00+05:30"),
        registrationOpensAt: new Date("2026-11-07T00:00:00+05:30"),
        registrationClosesAt: new Date("2027-01-22T23:59:00+05:30"),
        status: "REGISTRATION_OPEN",
        matCount: 2,
        paymentInstructions: { feeMinorUnits: 150000, currency: "INR", qrImageKey: "" },
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  if (!series) {
    return NextResponse.json({ error: "Failed to upsert Superfight Series" }, { status: 500 });
  }

  for (const name of DIVISIONS) {
    await Division.findOneAndUpdate(
      { eventId: series._id, name },
      {
        $set: { eventId: series._id, name, discipline: "No-Gi", capacity: 16, feeMinorUnitsOverride: null },
        $setOnInsert: { filledCount: 0 },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  invalidatePublicTags(["events", `event:${SERIES_SLUG}`, "schedule"]);

  return NextResponse.json({
    ok: true,
    demoted,
    series: { id: String(series._id), name: series.name, slug: series.slug, status: series.status },
  });
}
