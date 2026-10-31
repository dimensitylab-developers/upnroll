import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const REGISTRATION_STATUSES = [
  "AWAITING_PAYMENT",
  "PENDING_VERIFICATION",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

const ACTIVE_STATUSES: RegistrationStatus[] = ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"];

const registrationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    divisionId: { type: Schema.Types.ObjectId, ref: "Division", required: true, index: true },
    status: { type: String, enum: REGISTRATION_STATUSES, required: true, default: "AWAITING_PAYMENT" },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: REGISTRATION_STATUSES, required: true },
          at: { type: Date, required: true, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Blocks a second active (non-cancelled/rejected) registration by the same
// user in the same division — defense in depth alongside the service-layer
// check in registrationService.createRegistration.
registrationSchema.index(
  { userId: 1, divisionId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ACTIVE_STATUSES } } }
);

export type RegistrationDoc = InferSchemaType<typeof registrationSchema>;

export const Registration: Model<RegistrationDoc> =
  models.Registration ?? model<RegistrationDoc>("Registration", registrationSchema);
