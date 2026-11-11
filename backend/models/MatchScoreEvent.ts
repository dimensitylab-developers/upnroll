import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const SCORE_EVENT_TYPES = ["POINT", "PENALTY", "ADJUSTMENT", "UNDO", "STATUS", "FINALIZE"] as const;
export type ScoreEventType = (typeof SCORE_EVENT_TYPES)[number];

export const SCORE_SIDES = ["A", "B"] as const;
export type ScoreSide = (typeof SCORE_SIDES)[number];

export const SCORE_ACTOR_KINDS = ["JUDGE_SESSION", "ADMIN"] as const;
export type ScoreActorKind = (typeof SCORE_ACTOR_KINDS)[number];

const matchScoreEventSchema = new Schema(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    type: { type: String, enum: SCORE_EVENT_TYPES, required: true },
    side: { type: String, enum: SCORE_SIDES, default: undefined },
    value: { type: Number, required: true, default: 0 },
    label: { type: String, default: "" },
    actorKind: { type: String, enum: SCORE_ACTOR_KINDS, required: true },
    /** Judge credential id or admin user id — not a verified real-world person for judge sessions. */
    actorId: { type: Schema.Types.ObjectId, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "JudgeSession", default: null },
    sequence: { type: Number, required: true, min: 1 },
    matchVersion: { type: Number, required: true, min: 0 },
    idempotencyKey: { type: String, required: true },
    reversesEventId: { type: Schema.Types.ObjectId, ref: "MatchScoreEvent", default: null },
    reversedByEventId: { type: Schema.Types.ObjectId, ref: "MatchScoreEvent", default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

matchScoreEventSchema.index({ matchId: 1, sequence: 1 }, { unique: true });
matchScoreEventSchema.index({ matchId: 1, idempotencyKey: 1 }, { unique: true });

export type MatchScoreEventDoc = InferSchemaType<typeof matchScoreEventSchema>;

export const MatchScoreEvent: Model<MatchScoreEventDoc> =
  models.MatchScoreEvent ?? model<MatchScoreEventDoc>("MatchScoreEvent", matchScoreEventSchema);
