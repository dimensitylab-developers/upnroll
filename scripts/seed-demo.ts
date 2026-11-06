/**
 * Local fixture. Publishes the 23 January 2027 Superfight Series and
 * takes the fictional Underground Arena demo off the public list.
 * Run with: npm run seed-demo
 */
import { connectDB } from "../backend/db/connect";
import { Event } from "../backend/models/Event";
import { Division } from "../backend/models/Division";

const SERIES_SLUG = "up-n-roll-superfight-series";

const DIVISIONS = [
  "Men Beginner −55 kg",
  "Men Beginner −65 kg",
  "Men Beginner −75 kg",
  "Men Beginner −85 kg",
  "Men Intermediate −55 kg",
  "Men Intermediate −65 kg",
  "Men Intermediate −75 kg",
  "Men Intermediate −85 kg",
  "Women Beginner −55 kg",
  "Women Beginner −60 kg",
  "Women Beginner +60 kg",
  "Women Intermediate −55 kg",
  "Women Intermediate −60 kg",
  "Women Intermediate +60 kg",
];

async function main() {
  await connectDB();

  await Event.updateOne({ slug: "underground-arena-vol-4" }, { $set: { status: "DRAFT" } });

  const event = await Event.findOneAndUpdate(
    { slug: SERIES_SLUG },
    {
      name: "Up 'n Roll Superfight Series",
      slug: SERIES_SLUG,
      description: "Road to Super Fight.",
      venue: "",
      startDate: new Date("2027-01-23T10:00:00+05:30"),
      registrationOpensAt: new Date("2026-11-07T00:00:00+05:30"),
      registrationClosesAt: new Date("2027-01-22T23:59:00+05:30"),
      status: "REGISTRATION_OPEN",
      matCount: 1,
      paymentInstructions: { feeMinorUnits: 0, currency: "INR", qrImageKey: "" },
    },
    { upsert: true, returnDocument: "after" }
  );

  for (const name of DIVISIONS) {
    await Division.findOneAndUpdate(
      { eventId: event._id, name },
      { eventId: event._id, name, discipline: "No-Gi", capacity: 16, feeMinorUnitsOverride: null },
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log(`Seeded "${event.name}" (${event._id}) with ${DIVISIONS.length} divisions. Demo event is not public.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
