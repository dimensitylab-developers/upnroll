import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["FIGHTER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
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

export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", userSchema);
