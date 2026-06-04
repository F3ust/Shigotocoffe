import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  cafe: Types.ObjectId;
  rating: number;
  comment: string;
  reply?: {
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cafe: { type: Schema.Types.ObjectId, ref: "Cafe", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reply: {
      comment: { type: String },
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ cafe: 1, createdAt: -1 });
reviewSchema.index({ user: 1, cafe: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
