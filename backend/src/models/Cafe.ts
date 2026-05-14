import { Schema, model, Document, Types } from "mongoose";

interface BilingualText {
  ja: string;
  vi: string;
}

interface MenuItem {
  name: string;
  price: number;
  image?: string;
}

interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ICafe extends Document {
  _id: Types.ObjectId;
  name: BilingualText;
  description: BilingualText;
  address: BilingualText;
  district: string;
  openingHours: { open: string; close: string };
  isOpen: boolean;
  images: string[];
  menu: MenuItem[];
  hashtags: string[];
  averageRating: number;
  reviewCount: number;
  location: GeoLocation;
  owner?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cafeSchema = new Schema<ICafe>(
  {
    name: {
      ja: { type: String, required: true },
      vi: { type: String, required: true },
    },
    description: {
      ja: { type: String, required: true },
      vi: { type: String, required: true },
    },
    address: {
      ja: { type: String, required: true },
      vi: { type: String, required: true },
    },
    district: { type: String, required: true, index: true },
    openingHours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    isOpen: { type: Boolean, default: true },
    images: [{ type: String }],
    menu: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    hashtags: {
      type: [String],
      index: true,
      enum: ["wifi", "outlets", "quiet", "japanese", "noTimeLimit"],
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Text index for search across bilingual fields
cafeSchema.index({
  "name.ja": "text",
  "name.vi": "text",
  "description.ja": "text",
  "description.vi": "text",
});

// Geo index for future distance queries
cafeSchema.index({ location: "2dsphere" });

export const Cafe = model<ICafe>("Cafe", cafeSchema);
