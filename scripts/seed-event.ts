/**
 * Production-safe seed for the Jan 2027 No-Gi tournament.
 * Upserts the Superfight Series event + taxonomy divisions + scoring rules.
 * Weight class / experience level are chosen on the registration form only —
 * this script keeps the DB grid in sync; public pages no longer list them.
 * Does NOT create demo fighters, registrations, brackets, or matches.
 *
 *   npm run seed-event          # .env.local
 *   npm run seed-event:prod     # .env.service
 */
import mongoose from "mongoose";
import { connectDB } from "../backend/db/connect";
import { Event } from "../backend/models/Event";
import { Division } from "../backend/models/Division";
import { Registration } from "../backend/models/Registration";
import {
  noGiTournamentScoringRules,
  roadToSuperFightDivisionSeeds,
} from "../backend/services/divisionTaxonomy";

const SERIES_SLUG = "up-n-roll-superfight-series";
const FEE_MINOR_UNITS = 150_000;
const CAPACITY = 64;

async function main() {
  await connectDB();

  const scoringRules = noGiTournamentScoringRules();
  const seeds = roadToSuperFightDivisionSeeds();
  const seedNames = new Set(seeds.map((seed) => seed.name));

  const event = await Event.findOneAndUpdate(
    { slug: SERIES_SLUG },
    {
      $set: {
        name: "Up 'n Roll Jiu Jitsu Tournament — No-Gi (#2)",
        slug: SERIES_SLUG,
        description:
          "Grapplers only. No-Gi. Pick Beginner or Intermediate, then your weight class on the registration form. Contact: Instagram @up.n.roll · info.upnroll@gmail.com · +91 7738719800.",
        venue: "Navnit Gujarat Samaj Mumbai",
        startDate: new Date("2027-01-23T10:00:00+05:30"),
        registrationOpensAt: new Date("2026-11-07T00:00:00+05:30"),
        registrationClosesAt: new Date("2027-01-22T23:59:00+05:30"),
        status: "REGISTRATION_OPEN",
        matCount: 2,
        timezone: "Asia/Kolkata",
        paymentInstructions: {
          feeMinorUnits: FEE_MINOR_UNITS,
          currency: "INR",
          qrImageKey: "",
        },
        scoringRules: {
          configured: scoringRules.configured,
          winByHighestScore: scoringRules.winByHighestScore,
          allowTies: scoringRules.allowTies,
          points: [...scoringRules.points],
          penalties: [...scoringRules.penalties],
          outcomes: [...scoringRules.outcomes],
        },
      },
      $setOnInsert: {
        paymentOptions: [
          {
            label: "Standard entry",
            amountMinorUnits: FEE_MINOR_UNITS,
            currency: "INR",
            qrImageKey: "",
            active: true,
            isDefault: true,
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  if (!event) {
    throw new Error("Event upsert failed.");
  }

  // Ensure a default payment option exists when the event was already present
  // without paymentOptions (legacy rows).
  if (!event.paymentOptions?.length) {
    event.paymentOptions = [
      {
        label: "Standard entry",
        amountMinorUnits: FEE_MINOR_UNITS,
        currency: "INR",
        qrImageKey: "",
        active: true,
        isDefault: true,
      },
    ];
    await event.save();
  }

  let created = 0;
  let updated = 0;
  for (const seed of seeds) {
    const existing = await Division.findOne({ eventId: event._id, name: seed.name }).select("_id").lean();
    await Division.findOneAndUpdate(
      { eventId: event._id, name: seed.name },
      {
        $set: {
          eventId: event._id,
          name: seed.name,
          discipline: seed.discipline,
          capacity: CAPACITY,
          feeMinorUnitsOverride: null,
          gender: seed.gender,
          experienceLevel: seed.experienceLevel,
          weightBand: seed.weightBand,
          weightMinKg: seed.weightMinKg,
          weightMaxKg: seed.weightMaxKg,
        },
        $setOnInsert: { filledCount: 0 },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    if (existing) updated += 1;
    else created += 1;
  }

  // Drop legacy / out-of-grid rows (e.g. old seed-demo names, superseded −65 open band)
  // only when they have no registrations yet.
  const stale = await Division.find({ eventId: event._id, name: { $nin: [...seedNames] } })
    .select("_id name")
    .lean();
  let removed = 0;
  for (const row of stale) {
    const inUse = await Registration.exists({ divisionId: row._id });
    if (inUse) {
      console.log(`Kept stale division "${row.name}" (has registrations).`);
      continue;
    }
    await Division.deleteOne({ _id: row._id });
    removed += 1;
    console.log(`Removed stale division "${row.name}".`);
  }

  console.log(
    `Seeded event "${event.name}" (${event._id}) slug=${event.slug} status=${event.status}`
  );
  console.log(
    `Divisions: ${seeds.length} canonical (${created} created, ${updated} updated, ${removed} removed), capacity=${CAPACITY}`
  );
  console.log(`Fee: ₹${(FEE_MINOR_UNITS / 100).toFixed(0)} · Venue: ${event.venue}`);
  console.log(`Scoring rules configured: ${Boolean(event.scoringRules?.configured)}`);
  console.log("Public pages: weight classes appear only on the registration form after deploy.");

  try {
    await mongoose.disconnect();
  } catch {
    /* ignore — force exit below */
  }
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
