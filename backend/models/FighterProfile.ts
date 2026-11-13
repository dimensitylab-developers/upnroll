import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const fighterProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    gym: { type: String, default: "", trim: true },
    discipline: { type: String, default: "", trim: true },
    dateOfBirth: { type: String, default: "", trim: true },
    age: { type: Number, default: 0 },
    gender: { type: String, default: "", trim: true },
    mobile: { type: String, default: "", trim: true },
    nationality: { type: String, default: "", trim: true },
    // Aadhaar number (legacy), Aadhaar card image, medical answers, and the
    // passport photo stay off public pages.
    aadhaar: { type: String, default: "", trim: true },
    aadhaarImageKey: { type: String, default: "", trim: true },
    cityState: { type: String, default: "", trim: true },
    emergencyContactName: { type: String, default: "", trim: true },
    emergencyRelationship: { type: String, default: "", trim: true },
    bloodGroup: { type: String, default: "", trim: true },
    photoKey: { type: String, default: "", trim: true },
    academy: { type: String, default: "", trim: true },
    headCoach: { type: String, default: "", trim: true },
    beltRank: { type: String, default: "", trim: true },
    yearsTraining: { type: Number, default: 0 },
    weightDivision: { type: String, default: "", trim: true },
    heardAbout: { type: String, default: "", trim: true },
    hasMedicalCondition: { type: Boolean, default: false },
    medicalConditionDetail: { type: String, default: "", trim: true },
    hasAllergies: { type: Boolean, default: false },
    allergiesDetail: { type: String, default: "", trim: true },
    takingMedication: { type: Boolean, default: false },
    medicallyFit: { type: Boolean, default: false },
    waiverAcceptedAt: { type: Date },
  },
  { timestamps: true }
);

export type FighterProfileDoc = InferSchemaType<typeof fighterProfileSchema>;

export const FighterProfile: Model<FighterProfileDoc> =
  models.FighterProfile ?? model<FighterProfileDoc>("FighterProfile", fighterProfileSchema);
