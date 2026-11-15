/**
 * One-shot migration: role FIGHTER → GRAPPLER, and rename Mongo collection
 * fighterprofiles → grapplerprofiles when the old name still exists.
 *
 *   cd frontend && npx tsx ../scripts/migrate-fighter-to-grappler.ts
 *
 * Safe to re-run. App currently reads fighterprofiles via GrapplerProfile;
 * after this script, update backend/models/FighterProfile.ts collection arg
 * to "grapplerprofiles" (or leave as-is until you cut over).
 */
import { connectDB } from "../backend/db/connect";
import mongoose from "mongoose";

async function main() {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No Mongo database on the connection.");

  const users = db.collection("users");
  const roleResult = await users.updateMany({ role: "FIGHTER" }, { $set: { role: "GRAPPLER" } });
  console.log(`users.role FIGHTER → GRAPPLER: matched ${roleResult.matchedCount}, modified ${roleResult.modifiedCount}`);

  const collections = await db.listCollections().toArray();
  const names = new Set(collections.map((c) => c.name));
  if (names.has("fighterprofiles") && !names.has("grapplerprofiles")) {
    await db.renameCollection("fighterprofiles", "grapplerprofiles");
    console.log("Renamed collection fighterprofiles → grapplerprofiles");
  } else if (names.has("grapplerprofiles")) {
    console.log("Collection grapplerprofiles already exists; left fighterprofiles untouched if present.");
  } else {
    console.log("No fighterprofiles collection found (nothing to rename).");
  }
}

main()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
