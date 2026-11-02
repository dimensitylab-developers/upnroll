import { connectDB } from "@/server/db/connect";
import { MediaAsset } from "@/server/models/MediaAsset";
import { writeAuditLog } from "@/server/audit/log";

export async function createMediaAsset(adminId: string, input: { caption: string; externalUrl: string; eventId?: string }) {
  await connectDB();
  const asset = await MediaAsset.create({
    caption: input.caption,
    externalUrl: input.externalUrl,
    eventId: input.eventId || null,
    publicationState: "PUBLISHED",
    createdBy: adminId,
  });
  await writeAuditLog({ actorId: adminId, action: "MEDIA_CREATED", targetType: "MediaAsset", targetId: String(asset._id) });
  return asset;
}

export async function listAllMedia() {
  await connectDB();
  return MediaAsset.find().sort({ createdAt: -1 }).lean();
}

export async function listPublishedMedia() {
  await connectDB();
  return MediaAsset.find({ publicationState: "PUBLISHED" }).sort({ createdAt: -1 }).lean();
}
