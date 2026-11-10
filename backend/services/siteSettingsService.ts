import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { SiteSettings } from "@/server/models/SiteSettings";
import { writeAuditLog } from "@/server/audit/log";

const DEFAULTS = {
  key: "default",
  instagramHandle: "up.n.roll",
  email: "",
  phoneDisplay: "",
  phoneTel: "",
  city: "Mumbai",
} as const;

export type PublicSiteContact = {
  instagramHandle: string;
  instagramUrl: string;
  email: string;
  phoneDisplay: string;
  phoneTel: string;
  city: string;
};

function toPublic(doc: {
  instagramHandle?: string | null;
  email?: string | null;
  phoneDisplay?: string | null;
  phoneTel?: string | null;
  city?: string | null;
}): PublicSiteContact {
  const handle = (doc.instagramHandle || DEFAULTS.instagramHandle).replace(/^@/, "");
  return {
    instagramHandle: handle,
    instagramUrl: `https://www.instagram.com/${handle}/`,
    email: doc.email?.trim() ?? "",
    phoneDisplay: doc.phoneDisplay?.trim() ?? "",
    phoneTel: doc.phoneTel?.trim() ?? "",
    city: doc.city?.trim() || DEFAULTS.city,
  };
}

async function ensureDefaults() {
  const existing = await SiteSettings.findOne({ key: "default" });
  if (existing) return existing;
  return SiteSettings.create({ ...DEFAULTS });
}

export async function getPublicSiteContact(): Promise<PublicSiteContact> {
  await connectDB();
  const doc = await ensureDefaults();
  return toPublic(doc);
}

export async function getSiteSettingsForAdmin(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  const doc = await ensureDefaults();
  return toPublic(doc);
}

export type UpdateSiteSettingsInput = {
  instagramHandle: string;
  email: string;
  phoneDisplay: string;
  phoneTel: string;
  city: string;
};

export async function updateSiteSettings(actor: Actor, input: UpdateSiteSettingsInput) {
  assertAdmin(actor);
  await connectDB();
  const doc = await ensureDefaults();
  const before = toPublic(doc);
  doc.instagramHandle = input.instagramHandle.replace(/^@/, "").trim() || DEFAULTS.instagramHandle;
  doc.email = input.email.trim();
  doc.phoneDisplay = input.phoneDisplay.trim();
  doc.phoneTel = input.phoneTel.trim();
  doc.city = input.city.trim() || DEFAULTS.city;
  await doc.save();
  const after = toPublic(doc);
  await writeAuditLog({
    actorId: actor.userId,
    action: "SITE_SETTINGS_UPDATED",
    targetType: "SiteSettings",
    targetId: String(doc._id),
    before,
    after,
  });
  return after;
}
