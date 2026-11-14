import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const divisionSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true },
    discipline: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    // Set by createDivision or the occupancy backfill. A missing value is not zero.
    filledCount: { type: Number, min: 0 },
    // Overrides Event.paymentInstructions.feeMinorUnits when set; null means "use event default".
    feeMinorUnitsOverride: { type: Number, default: null },
    /** Structured taxonomy for Road to Super Fight registration (optional for legacy divisions). */
    gender: { type: String, enum: ["", "MALE", "FEMALE"], default: "" },
    experienceLevel: { type: String, enum: ["", "BEGINNER", "INTERMEDIATE"], default: "" },
    weightBand: { type: String, default: "", trim: true },
    weightMinKg: { type: Number, default: null },
    weightMaxKg: { type: Number, default: null },
  },
  { timestamps: true }
);

export type DivisionDoc = InferSchemaType<typeof divisionSchema>;

export const Division: Model<DivisionDoc> = models.Division ?? model<DivisionDoc>("Division", divisionSchema);
