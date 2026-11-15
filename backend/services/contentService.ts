import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { ContentEntry, type ContentType } from "@/server/models/ContentEntry";
import { User } from "@/server/models/User";
import { STARTER_FAQS } from "@/server/content/starterFaqs";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError } from "@/server/http/errors";

/** Once seeded in this process, starter FAQs never need re-checking  avoids 21 sequential
 *  findOne calls on every chatbot question. Reset only by a process restart/redeploy. */
let starterFaqsEnsured = false;

/** Publish missing starter FAQs so the page and chatbot stay current as the site grows. */
async function ensureStarterFaqs() {
  if (starterFaqsEnsured) return;

  const admin = await User.findOne({ role: "ADMIN" }).select("_id").lean();
  if (!admin) return;

  const existing = await ContentEntry.find({
    type: "FAQ",
    title: { $in: STARTER_FAQS.map((faq) => faq.question) },
  })
    .select("title")
    .lean();
  const existingTitles = new Set(existing.map((entry) => entry.title));

  const now = Date.now();
  const missing = STARTER_FAQS.map((faq, index) => ({ faq, index })).filter(
    ({ faq }) => !existingTitles.has(faq.question)
  );
  if (missing.length > 0) {
    await ContentEntry.insertMany(
      missing.map(({ faq, index }) => ({
        type: "FAQ",
        title: faq.question,
        body: faq.answer,
        publicationState: "PUBLISHED",
        createdBy: admin._id,
        createdAt: new Date(now - index * 1000),
        updatedAt: new Date(now - index * 1000),
      }))
    );
  }

  // Keep "What should I wear?" aligned if an older seed included sponsor purchase wording
  const wearCanonical = STARTER_FAQS.find((faq) => faq.question === "What should I wear?")?.answer;
  if (wearCanonical) {
    await ContentEntry.updateMany(
      {
        type: "FAQ",
        title: "What should I wear?",
        body: { $regex: /mouthguard sponsor|buy one from the mouthguard/i },
      },
      {
        $set: { body: wearCanonical, updatedAt: new Date() },
      }
    );
  }

  starterFaqsEnsured = true;
}

export async function createContentEntry(
  actor: Actor,
  input: { type: ContentType; title: string; body: string; publicationState?: "DRAFT" | "PUBLISHED" }
) {
  assertAdmin(actor);
  await connectDB();
  const entry = await ContentEntry.create({
    type: input.type,
    title: input.title,
    body: input.body,
    publicationState: input.publicationState ?? "DRAFT",
    createdBy: actor.userId,
  });
  await writeAuditLog({ actorId: actor.userId, action: "CONTENT_CREATED", targetType: "ContentEntry", targetId: String(entry._id) });
  return entry;
}

export async function setContentPublicationState(actor: Actor, entryId: string, state: "DRAFT" | "PUBLISHED") {
  assertAdmin(actor);
  await connectDB();
  const entry = await ContentEntry.findById(entryId);
  if (!entry) throw new NotFoundError("Content entry not found.");
  entry.publicationState = state;
  await entry.save();
  await writeAuditLog({ actorId: actor.userId, action: "CONTENT_PUBLICATION_CHANGED", targetType: "ContentEntry", targetId: entryId, after: { state } });
  return entry;
}

export async function updateContentEntry(
  actor: Actor,
  entryId: string,
  input: { title: string; body: string; type: ContentType }
) {
  assertAdmin(actor);
  await connectDB();
  const entry = await ContentEntry.findById(entryId);
  if (!entry) throw new NotFoundError("Content entry not found.");
  const before = { title: entry.title, body: entry.body, type: entry.type };
  entry.title = input.title;
  entry.body = input.body;
  entry.type = input.type;
  await entry.save();
  await writeAuditLog({
    actorId: actor.userId,
    action: "CONTENT_UPDATED",
    targetType: "ContentEntry",
    targetId: entryId,
    before,
    after: { title: entry.title, body: entry.body, type: entry.type },
  });
  return entry;
}

export async function listAllContent(actor: Actor, type?: ContentType) {
  assertAdmin(actor);
  await connectDB();
  return ContentEntry.find(type ? { type } : {}).sort({ createdAt: -1 }).lean();
}

export async function listPublished(type: ContentType) {
  await connectDB();
  if (type === "FAQ") await ensureStarterFaqs();
  return ContentEntry.find({ type, publicationState: "PUBLISHED" }).sort({ createdAt: -1 }).lean();
}
