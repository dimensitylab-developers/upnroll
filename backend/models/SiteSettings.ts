import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Singleton document — one house contact card for the public site. */
const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    instagramHandle: { type: String, default: "up.n.roll", trim: true },
    email: { type: String, default: "", trim: true },
    phoneDisplay: { type: String, default: "", trim: true },
    phoneTel: { type: String, default: "", trim: true },
    city: { type: String, default: "Mumbai", trim: true },
  },
  { timestamps: true }
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;

export const SiteSettings: Model<SiteSettingsDoc> =
  models.SiteSettings ?? model<SiteSettingsDoc>("SiteSettings", siteSettingsSchema);
