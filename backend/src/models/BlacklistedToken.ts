import { Schema, model, Document } from "mongoose";

export interface IBlacklistedToken extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove documents after expiresAt
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
blacklistedTokenSchema.index({ token: 1 });

export const BlacklistedToken = model<IBlacklistedToken>("BlacklistedToken", blacklistedTokenSchema);
