import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "owner";
  avatar?: string;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "owner"], required: true },
    avatar: { type: String },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Cafe" }],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

export const User = model<IUser>("User", userSchema);
