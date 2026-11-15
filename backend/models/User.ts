import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Canonical roles for new writes and TypeScript. Legacy Mongo docs may still store "FIGHTER". */
export const USER_ROLES = ["GRAPPLER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Schema enum includes legacy "FIGHTER" so existing users still load. */
const ROLE_ENUM = ["GRAPPLER", "ADMIN", "FIGHTER"] as const;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // House / grappler greeting name. Grapplers also keep displayName on GrapplerProfile.
    displayName: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLE_ENUM, required: true, default: "GRAPPLER" },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], required: true, default: "ACTIVE" },
    // False means a new account is waiting on the email code. Missing means an
    // account from before verification, which can still sign in.
    emailVerified: { type: Boolean },
    emailVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;

// HMR can keep a previously compiled User model. Re-add paths so new fields
// (like displayName) are not stripped under mongoose strict mode.
const existing = models.User as Model<UserDoc> | undefined;
if (existing && !existing.schema.path("displayName")) {
  existing.schema.add({ displayName: { type: String, default: "", trim: true } });
}

export const User: Model<UserDoc> = existing ?? model<UserDoc>("User", userSchema);
