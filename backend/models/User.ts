import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["FIGHTER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // House / fighter greeting name. Fighters also keep displayName on FighterProfile.
    displayName: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, default: "FIGHTER" },
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
