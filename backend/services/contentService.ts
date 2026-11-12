import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { ContentEntry, type ContentType } from "@/server/models/ContentEntry";
import { User } from "@/server/models/User";
import { STARTER_FAQS } from "@/server/content/starterFaqs";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError } from "@/server/http/errors";

/** Publish missing starter FAQs so the page and chatbot stay current as the site grows. */
async function ensureStarterFaqs() {
  const admin = await User.findOne({ role: "ADMIN" }).select("_id").lean();
  if (!admin) return;

  const now = Date.now();
  for (const [index, faq] of STARTER_FAQS.entries()) {
    const exists = await ContentEntry.findOne({ type: "FAQ", title: faq.question }).select("_id").lean();
    if (exists) continue;
    await ContentEntry.create({
      type: "FAQ",
      title: faq.question,
      body: faq.answer,
      publicationState: "PUBLISHED",
      createdBy: admin._id,
      createdAt: new Date(now - index * 1000),
      updatedAt: new Date(now - index * 1000),
    });
  }
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
