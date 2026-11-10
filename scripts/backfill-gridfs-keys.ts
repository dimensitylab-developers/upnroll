/**
 * Remap path-label storage keys (profiles/…, payment-screenshots/…, events/…)
 * to gridfs:<id> by matching GridFS privateFiles.filename.
 *
 * Only needed after fixing callers that ignored StorageAdapter.put()'s return value.
 * Orphans (path key in Mongo, no GridFS file) are reported — re-upload those.
 *
 *   npm run backfill-gridfs-keys
 * from frontend/ (loads .env.local).
 */
import mongoose from "mongoose";
import { connectDB } from "../backend/db/connect";
import { FighterProfile } from "../backend/models/FighterProfile";
import { PaymentSubmission } from "../backend/models/PaymentSubmission";
import { Event } from "../backend/models/Event";
import { formatGridFsKey, isGridFsKey } from "../backend/storage/keys";

const BUCKET_FILES = "privateFiles.files";

type RemapResult = { updated: number; orphaned: string[]; skipped: number };

function isPathLabel(key: string | null | undefined): key is string {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (!trimmed || isGridFsKey(trimmed)) return false;
  return (
    trimmed.startsWith("profiles/") ||
    trimmed.startsWith("payment-screenshots/") ||
    trimmed.startsWith("events/")
  );
}

async function lookupGridFsId(filename: string): Promise<string | null> {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection is not ready.");
  // Prefer the newest upload when multiple files share the same filename label.
  const file = await db.collection(BUCKET_FILES).find({ filename }).sort({ uploadDate: -1 }).limit(1).next();
  if (!file?._id) return null;
  return formatGridFsKey(file._id as import("mongodb").ObjectId);
}

async function remapProfiles(): Promise<RemapResult> {
  const docs = await FighterProfile.find({ photoKey: { $exists: true, $ne: "" } })
    .select("_id photoKey")
    .lean();
  let updated = 0;
  let skipped = 0;
  const orphaned: string[] = [];

  for (const doc of docs) {
    const key = doc.photoKey;
    if (!isPathLabel(key)) {
      skipped += 1;
      continue;
    }
    const gridKey = await lookupGridFsId(key);
    if (!gridKey) {
      orphaned.push(`FighterProfile ${String(doc._id)} photoKey=${key}`);
      continue;
    }
    await FighterProfile.updateOne({ _id: doc._id }, { $set: { photoKey: gridKey } });
    updated += 1;
    console.log(`  profile ${String(doc._id)}: ${key} → ${gridKey}`);
  }

  return { updated, orphaned, skipped };
}

async function remapPayments(): Promise<RemapResult> {
  const docs = await PaymentSubmission.find({ screenshotStorageKey: { $exists: true, $ne: null } })
    .select("_id screenshotStorageKey")
    .lean();
  let updated = 0;
  let skipped = 0;
  const orphaned: string[] = [];

  for (const doc of docs) {
    const key = doc.screenshotStorageKey;
    if (!isPathLabel(key)) {
      skipped += 1;
      continue;
    }
    const gridKey = await lookupGridFsId(key);
    if (!gridKey) {
      orphaned.push(`PaymentSubmission ${String(doc._id)} screenshotStorageKey=${key}`);
      continue;
    }
    await PaymentSubmission.updateOne({ _id: doc._id }, { $set: { screenshotStorageKey: gridKey } });
    updated += 1;
    console.log(`  payment ${String(doc._id)}: ${key} → ${gridKey}`);
  }

  return { updated, orphaned, skipped };
}

async function remapEvents(): Promise<RemapResult> {
  const docs = await Event.find({ "paymentInstructions.qrImageKey": { $exists: true, $ne: "" } })
    .select("_id paymentInstructions.qrImageKey")
    .lean();
  let updated = 0;
  let skipped = 0;
  const orphaned: string[] = [];

  for (const doc of docs) {
    const key = doc.paymentInstructions?.qrImageKey;
    if (!isPathLabel(key)) {
      skipped += 1;
      continue;
    }
    const gridKey = await lookupGridFsId(key);
    if (!gridKey) {
      orphaned.push(`Event ${String(doc._id)} qrImageKey=${key}`);
      continue;
    }
    await Event.updateOne(
      { _id: doc._id },
      { $set: { "paymentInstructions.qrImageKey": gridKey } }
    );
    updated += 1;
    console.log(`  event ${String(doc._id)}: ${key} → ${gridKey}`);
  }

  return { updated, orphaned, skipped };
}

async function main() {
  await connectDB();
  console.log("Backfilling GridFS storage keys…");

  console.log("FighterProfile.photoKey");
  const profiles = await remapProfiles();
  console.log("PaymentSubmission.screenshotStorageKey");
  const payments = await remapPayments();
  console.log("Event.paymentInstructions.qrImageKey");
  const events = await remapEvents();

  const updated = profiles.updated + payments.updated + events.updated;
  const orphaned = [...profiles.orphaned, ...payments.orphaned, ...events.orphaned];
  const skipped = profiles.skipped + payments.skipped + events.skipped;

  console.log(`\nDone. Updated ${updated}. Already ok/skipped ${skipped}. Orphans ${orphaned.length}.`);
  for (const line of orphaned) {
    console.log(`  ORPHAN (re-upload needed): ${line}`);
  }

  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
