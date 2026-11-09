import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { MediaAsset } from "@/server/models/MediaAsset";
import { writeAuditLog } from "@/server/audit/log";

export async function createMediaAsset(actor: Actor, input: { caption: string; externalUrl: string; eventId?: string }) {
  assertAdmin(actor);
  await connectDB();
  const asset = await MediaAsset.create({
    caption: input.caption,
    externalUrl: input.externalUrl,
    eventId: input.eventId || null,
    publicationState: "PUBLISHED",
    createdBy: actor.userId,
  });
  await writeAuditLog({ actorId: actor.userId, action: "MEDIA_CREATED", targetType: "MediaAsset", targetId: String(asset._id) });
  return asset;
}

export async function listAllMedia(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  return MediaAsset.find().sort({ createdAt: -1 }).lean();
}

export async function listPublishedMedia() {
  await connectDB();
  return MediaAsset.find({ publicationState: "PUBLISHED" }).sort({ createdAt: -1 }).lean();
}

export async function listPublishedMediaForEvent(eventId: string) {
  await connectDB();
  return MediaAsset.find({ publicationState: "PUBLISHED", eventId }).sort({ createdAt: 1 }).lean();
}
