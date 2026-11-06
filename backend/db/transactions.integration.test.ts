import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const TEST_DATABASE = "upnrol_txn_test";

function fileEnv(name: string): string | undefined {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const files = [
    path.resolve(here, "../../frontend/.env.local"),
    path.resolve(here, "../../frontend/.env"),
    path.resolve(here, "../../.env"),
  ];
  for (const file of files) {
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0 || trimmed.slice(0, eq).trim() !== name) continue;
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (value) return value;
    }
  }
  return undefined;
}

function withTestDatabase(uri: string): string {
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) throw new Error("MONGODB_URI must be a MongoDB connection string.");
  return `${match[1]}/${TEST_DATABASE}${match[3] ?? ""}`;
}

const atlasUri = process.env.MONGODB_URI || fileEnv("MONGODB_URI");
const usesAtlas = Boolean(atlasUri && /^mongodb(\+srv)?:\/\//.test(atlasUri) && !/127\.0\.0\.1|localhost/.test(atlasUri));
if (usesAtlas && atlasUri) {
  process.env.MONGODB_URI = withTestDatabase(atlasUri);
  const secret = process.env.SESSION_SECRET || fileEnv("SESSION_SECRET");
  process.env.SESSION_SECRET = secret && secret.length >= 32 ? secret : "c".repeat(32);
}

describe.skipIf(!usesAtlas)("atlas transactions", () => {
  beforeAll(async () => {
    const { connectDB } = await import("./connect");
    try {
      await connectDB();
    } catch (err) {
      const message = err instanceof Error ? err.message : "connection failed";
      throw new Error(message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "mongodb://redacted"));
    }
  }, 120000);

  afterAll(async () => {
    const mongoose = await import("mongoose");
    if (mongoose.default.connection.readyState !== 1) return;
    const name = mongoose.default.connection.db?.databaseName;
    if (name !== TEST_DATABASE) {
      throw new Error(`Refusing to drop database "${name ?? "unknown"}".`);
    }
    await mongoose.default.connection.dropDatabase();
    await mongoose.default.disconnect();
  });

  it("commits, rolls back, ends the session, and propagates the error", async () => {
    const mongoose = await import("mongoose");
    const { withTransaction } = await import("./transaction");
    const { Division } = await import("../models/Division");
    const { Event } = await import("../models/Event");
    const { ValidationError } = await import("../http/errors");
    const event = await Event.create(openEvent("txn-event"));
    const sessions: { hasEnded: boolean }[] = [];
    const original = mongoose.default.startSession.bind(mongoose.default);
    mongoose.default.startSession = async (...args: unknown[]) => {
      const session = await original(...(args as []));
      sessions.push(session as { hasEnded: boolean });
      return session;
    };

    try {
      await withTransaction(async (session) => {
        await Division.create([{ eventId: event._id, name: "Kept", discipline: "No-Gi", capacity: 2, filledCount: 0 }], { session });
      });
      await expect(
        withTransaction(async (session) => {
          await Division.create([{ eventId: event._id, name: "Rolled", discipline: "No-Gi", capacity: 2, filledCount: 0 }], { session });
          throw new ValidationError("stop");
        })
      ).rejects.toThrow(ValidationError);
      expect(await Division.countDocuments({ eventId: event._id, name: "Kept" })).toBe(1);
      expect(await Division.countDocuments({ eventId: event._id, name: "Rolled" })).toBe(0);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions.every((session) => session.hasEnded)).toBe(true);
    } finally {
      mongoose.default.startSession = original;
    }
  });

  it("registers one seat, blocks a duplicate, and blocks a second fighter when the division is full", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { Registration } = await import("../models/Registration");
    const { User } = await import("../models/User");
    const { createRegistration } = await import("../services/registrationService");
    const { ConflictError, ValidationError } = await import("../http/errors");
    const event = await Event.create(openEvent("reg-event"));
    const division = await Division.create({ eventId: event._id, name: "Full", discipline: "No-Gi", capacity: 1, filledCount: 0 });
    const first = await user("one@example.com");
    const second = await user("two@example.com");
    const consents = { consent: true, agreement: true };

    await createRegistration(fighter(first), String(division._id), consents);
    await expect(createRegistration(fighter(first), String(division._id), consents)).rejects.toBeInstanceOf(ConflictError);
    await expect(createRegistration(fighter(second), String(division._id), consents)).rejects.toBeInstanceOf(ConflictError);

    const stored = await Division.findById(division._id).lean();
    expect(stored?.filledCount).toBe(1);
    expect(await Registration.countDocuments({ divisionId: division._id })).toBe(1);

    const unset = await Division.collection.insertOne({
      eventId: event._id,
      name: "Unset",
      discipline: "No-Gi",
      capacity: 2,
    });
    await expect(createRegistration(fighter(second), String(unset.insertedId), consents)).rejects.toBeInstanceOf(ValidationError);
    expect(await Registration.countDocuments({ divisionId: unset.insertedId })).toBe(0);
  });

  it("does not let two fighters take the last seat", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { Registration } = await import("../models/Registration");
    const { createRegistration } = await import("../services/registrationService");
    const event = await Event.create(openEvent("race-event"));
    const division = await Division.create({ eventId: event._id, name: "Race", discipline: "No-Gi", capacity: 1, filledCount: 0 });
    const a = await user("race-a@example.com");
    const b = await user("race-b@example.com");
    const consents = { consent: true, agreement: true };
    const results = await Promise.allSettled([
      createRegistration(fighter(a), String(division._id), consents),
      createRegistration(fighter(b), String(division._id), consents),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const stored = await Division.findById(division._id).lean();
    expect(stored?.filledCount).toBe(1);
    expect(await Registration.countDocuments({ divisionId: division._id, status: { $in: ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"] } })).toBe(1);
  });

  it("rejects a payment once, releases the seat, and refuses a second decision", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { Registration } = await import("../models/Registration");
    const { PaymentSubmission } = await import("../models/PaymentSubmission");
    const { rejectPayment } = await import("../services/paymentService");
    const { ConflictError } = await import("../http/errors");
    const event = await Event.create(openEvent("pay-event"));
    const division = await Division.create({ eventId: event._id, name: "Pay", discipline: "No-Gi", capacity: 4, filledCount: 1 });
    const fighterUser = await user("pay@example.com");
    const adminUser = await user("pay-admin@example.com", "ADMIN");
    const registration = await Registration.create({
      userId: fighterUser._id,
      eventId: event._id,
      divisionId: division._id,
      status: "PENDING_VERIFICATION",
      statusHistory: [{ status: "PENDING_VERIFICATION", at: new Date() }],
    });
    const payment = await PaymentSubmission.create({
      registrationId: registration._id,
      userId: fighterUser._id,
      eventId: event._id,
      expectedAmountMinorUnits: 100,
      status: "PENDING_REVIEW",
    });
    await rejectPayment(actor(adminUser, "ADMIN"), String(payment._id), "UTR does not match");
    await expect(rejectPayment(actor(adminUser, "ADMIN"), String(payment._id), "again")).rejects.toBeInstanceOf(ConflictError);
    expect((await Division.findById(division._id).lean())?.filledCount).toBe(0);
    expect((await Registration.findById(registration._id).lean())?.status).toBe("REJECTED");
    expect((await PaymentSubmission.findById(payment._id).lean())?.status).toBe("REJECTED");
  });

  it("publishes a bracket once and keeps one published document", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { Registration } = await import("../models/Registration");
    const { Bracket } = await import("../models/Bracket");
    const { Match } = await import("../models/Match");
    const { generateBracket, publishBracket } = await import("../services/bracketService");
    const { ConflictError } = await import("../http/errors");
    const event = await Event.create(openEvent("bracket-event"));
    const division = await Division.create({ eventId: event._id, name: "Bracket", discipline: "No-Gi", capacity: 4, filledCount: 2 });
    const a = await user("b-a@example.com");
    const b = await user("b-b@example.com");
    const adminUser = await user("b-admin@example.com", "ADMIN");
    const regA = await Registration.create({ userId: a._id, eventId: event._id, divisionId: division._id, status: "CONFIRMED", statusHistory: [] });
    const regB = await Registration.create({ userId: b._id, eventId: event._id, divisionId: division._id, status: "CONFIRMED", statusHistory: [] });
    const bracket = await generateBracket(actor(adminUser, "ADMIN"), String(division._id), [String(regA._id), String(regB._id)], { type: "manual" });
    expect(await Match.countDocuments({ bracketId: bracket._id })).toBeGreaterThan(0);
    const published = await publishBracket(actor(adminUser, "ADMIN"), String(bracket._id));
    await expect(publishBracket(actor(adminUser, "ADMIN"), String(bracket._id))).rejects.toBeInstanceOf(ConflictError);
    expect(await Bracket.countDocuments({ divisionId: division._id, status: "PUBLISHED" })).toBe(1);
    expect(published.status).toBe("PUBLISHED");
  });

  it("keeps ranking rows on one calculation version when two recalculations overlap", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { Registration } = await import("../models/Registration");
    const { Bracket } = await import("../models/Bracket");
    const { Match } = await import("../models/Match");
    const { RankingRecord } = await import("../models/RankingRecord");
    const { recalculateRankings } = await import("../services/rankingService");
    const event = await Event.create(openEvent("rank-event"));
    const division = await Division.create({ eventId: event._id, name: "Rank", discipline: "No-Gi", capacity: 4, filledCount: 2 });
    const a = await user("r-a@example.com");
    const b = await user("r-b@example.com");
    const adminUser = await user("r-admin@example.com", "ADMIN");
    const regA = await Registration.create({ userId: a._id, eventId: event._id, divisionId: division._id, status: "CONFIRMED", statusHistory: [] });
    const regB = await Registration.create({ userId: b._id, eventId: event._id, divisionId: division._id, status: "CONFIRMED", statusHistory: [] });
    const bracket = await Bracket.create({ eventId: event._id, divisionId: division._id, format: "SINGLE_ELIMINATION", seed: 1, roundsCount: 1, status: "DRAFT", version: 1 });
    await Match.create({
      eventId: event._id,
      divisionId: division._id,
      bracketId: bracket._id,
      round: 1,
      order: 1,
      competitorARegistrationId: regA._id,
      competitorBRegistrationId: regB._id,
      winnerRegistrationId: regA._id,
      status: "COMPLETED",
      resultMethod: "Points",
    });
    const results = await Promise.allSettled([
      recalculateRankings(actor(adminUser, "ADMIN")),
      recalculateRankings(actor(adminUser, "ADMIN")),
    ]);
    expect(results.some((result) => result.status === "fulfilled")).toBe(true);
    const rows = await RankingRecord.find({ userId: { $in: [a._id, b._id] } }).lean();
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.calculationVersion)).size).toBe(1);
  });

  it("stops the occupancy backfill when a stored counter disagrees", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { applyDivisionOccupancyBackfill } = await import("./backfillDivisionOccupancy");
    const event = await Event.create(openEvent("backfill-event"));
    const division = await Division.create({ eventId: event._id, name: "Wrong", discipline: "No-Gi", capacity: 4, filledCount: 3 });
    const before = division.filledCount;
    await expect(applyDivisionOccupancyBackfill()).rejects.toThrow(/disagree/);
    expect((await Division.findById(division._id).lean())?.filledCount).toBe(before);
  });

  it("refuses a capacity below the current occupancy", async () => {
    const { Event } = await import("../models/Event");
    const { Division } = await import("../models/Division");
    const { setDivisionCapacity } = await import("../services/eventService");
    const { ConflictError } = await import("../http/errors");
    const event = await Event.create(openEvent("cap-event"));
    const division = await Division.create({ eventId: event._id, name: "Cap", discipline: "No-Gi", capacity: 4, filledCount: 2 });
    const adminUser = await user("cap-admin@example.com", "ADMIN");
    await expect(setDivisionCapacity(actor(adminUser, "ADMIN"), String(division._id), 1)).rejects.toBeInstanceOf(ConflictError);
    expect((await Division.findById(division._id).lean())?.capacity).toBe(4);
  });
});

function openEvent(slug: string) {
  const now = new Date();
  return {
    name: slug,
    slug,
    startDate: new Date(now.getTime() + 40 * 86400000),
    registrationOpensAt: new Date(now.getTime() - 86400000),
    registrationClosesAt: new Date(now.getTime() + 10 * 86400000),
    status: "REGISTRATION_OPEN" as const,
    matCount: 1,
    paymentInstructions: { feeMinorUnits: 100, currency: "INR", qrImageKey: "" },
  };
}

async function user(email: string, role: "FIGHTER" | "ADMIN" = "FIGHTER") {
  const { User } = await import("../models/User");
  return User.create({ email, passwordHash: "hash", role, status: "ACTIVE" });
}

function fighter(doc: { _id: unknown }) {
  return Object.freeze({ userId: String(doc._id), role: "FIGHTER" as const });
}

function actor(doc: { _id: unknown }, role: "FIGHTER" | "ADMIN") {
  return Object.freeze({ userId: String(doc._id), role });
}
