import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const divisionSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true },
    discipline: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    // Overrides Event.paymentInstructions.feeMinorUnits when set; null means "use event default".
    feeMinorUnitsOverride: { type: Number, default: null },
  },
  { timestamps: true }
);

export type DivisionDoc = InferSchemaType<typeof divisionSchema>;

export const Division: Model<DivisionDoc> = models.Division ?? model<DivisionDoc>("Division", divisionSchema);
