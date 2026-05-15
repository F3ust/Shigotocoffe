import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config";
import { Cafe } from "../models/Cafe";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { cafeSeedData } from "./cafeSeedData";
import { buildReviewSeeds } from "./reviewSeedData";

const DEMO_EMAIL = "demo@shigoto.local";
const DEMO_PASSWORD = "demo1234";

async function seed(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    await Review.deleteMany({});
    await Cafe.deleteMany({});
    console.log("Cleared existing cafe and review data");

    const result = await Cafe.insertMany(cafeSeedData);
    console.log(`Seeded ${result.length} cafes`);

    let demo = await User.findOne({ email: DEMO_EMAIL });
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    if (!demo) {
      demo = await User.create({
        name: "Demo User",
        email: DEMO_EMAIL,
        password: passwordHash,
        role: "user",
      });
      console.log(`Seeded demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    } else {
      demo.password = passwordHash;
      demo.name = "Demo User";
      demo.role = "user";
      await demo.save();
      console.log(`Updated demo login password: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    }

    const reviews = buildReviewSeeds(
      result.map((c) => c._id),
      demo._id
    );
    await Review.insertMany(reviews);
    console.log(`Seeded ${reviews.length} reviews for demo user`);

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    console.error(
      [
        "",
        "Could not seed database.",
        "  docker compose -p shigoto-coffee up -d",
        "  .env at repo root (see .env.example)",
        "",
      ].join("\n")
    );
    process.exit(1);
  }
}

seed();
