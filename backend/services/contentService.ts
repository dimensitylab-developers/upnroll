import { connectDB } from "@/server/db/connect";
import { ContentEntry, type ContentType } from "@/server/models/ContentEntry";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError } from "@/server/http/errors";

export async function createContentEntry(
  adminId: string,
  input: { type: ContentType; title: string; body: string; publicationState?: "DRAFT" | "PUBLISHED" }
) {
  await connectDB();
  const entry = await ContentEntry.create({
    type: input.type,
    title: input.title,
    body: input.body,
    publicationState: input.publicationState ?? "DRAFT",
    createdBy: adminId,
  });
  await writeAuditLog({ actorId: adminId, action: "CONTENT_CREATED", targetType: "ContentEntry", targetId: String(entry._id) });
  return entry;
}

export async function setContentPublicationState(adminId: string, entryId: string, state: "DRAFT" | "PUBLISHED") {
  await connectDB();
  const entry = await ContentEntry.findById(entryId);
  if (!entry) throw new NotFoundError("Content entry not found.");
  entry.publicationState = state;
  await entry.save();
  await writeAuditLog({ actorId: adminId, action: "CONTENT_PUBLICATION_CHANGED", targetType: "ContentEntry", targetId: entryId, after: { state } });
  return entry;
}

export async function listAllContent(type?: ContentType) {
  await connectDB();
  return ContentEntry.find(type ? { type } : {}).sort({ createdAt: -1 }).lean();
}

export async function listPublished(type: ContentType) {
  await connectDB();
  return ContentEntry.find({ type, publicationState: "PUBLISHED" }).sort({ createdAt: -1 }).lean();
}
