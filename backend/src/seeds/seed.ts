import mongoose from "mongoose";
import { config } from "../config";
import { Cafe } from "../models/Cafe";
import { cafeSeedData } from "./cafeSeedData";

async function seed(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    await Cafe.deleteMany({});
    console.log("Cleared existing cafe data");

    const result = await Cafe.insertMany(cafeSeedData);
    console.log(`Seeded ${result.length} cafes`);

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
