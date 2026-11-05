/**
 * Local dev fixture only — creates one demo Event + two Divisions so the
 * Phase 3 registration/payment flow can be exercised locally. NOT a
 * production admin feature (event creation UI is Phase 4). Run with:
 *   npx tsx --env-file=.env.local scripts/seed-demo.ts
 */
import { connectDB } from "../backend/db/connect";
import { Event } from "../backend/models/Event";
import { Division } from "../backend/models/Division";

async function main() {
  await connectDB();

  const now = new Date();
  const registrationOpensAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const registrationClosesAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const startDate = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

  const event = await Event.findOneAndUpdate(
    { slug: "underground-arena-vol-4" },
    {
      name: "Underground Arena Vol. 4",
      slug: "underground-arena-vol-4",
      description: "Fictional demo event for local Phase 3 testing.",
      venue: "Demo Venue",
      startDate,
      registrationOpensAt,
      registrationClosesAt,
      status: "REGISTRATION_OPEN",
      paymentInstructions: { feeMinorUnits: 150000, currency: "INR", qrImageKey: "" },
    },
    { upsert: true, returnDocument: "after" }
  );

  const divisions = [
    { name: "Lightweight", discipline: "Grappling", capacity: 16 },
    { name: "Welterweight", discipline: "MMA", capacity: 16 },
  ];

  for (const d of divisions) {
    await Division.findOneAndUpdate(
      { eventId: event._id, name: d.name },
      { eventId: event._id, name: d.name, discipline: d.discipline, capacity: d.capacity, feeMinorUnitsOverride: null },
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log(`Seeded event "${event.name}" (${event._id}) with ${divisions.length} divisions.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
