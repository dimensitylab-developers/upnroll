import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["FIGHTER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, default: "FIGHTER" },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], required: true, default: "ACTIVE" },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", userSchema);
