import { Types } from "mongoose";

export interface ReviewSeedInput {
  user: Types.ObjectId;
  cafe: Types.ObjectId;
  rating: number;
  comment: string;
}

const COMMENTS: string[] = [
  "Great Wi-Fi and quiet corners for focused work.",
  "Love the outlets and no time limit policy.",
  "Perfect for remote work — will come back.",
  "Good coffee and calm atmosphere.",
  "Spacious seating and friendly staff.",
  "Ideal spot for afternoon coding sessions.",
];

/** Several seeded reviews per café from the demo user (see `seed.ts`). */
export function buildReviewSeeds(
  cafeIds: Types.ObjectId[],
  userId: Types.ObjectId
): ReviewSeedInput[] {
  const rows: ReviewSeedInput[] = [];
  for (const cafeId of cafeIds) {
    for (let i = 0; i < 3; i++) {
      const comment = COMMENTS[i % COMMENTS.length];
      if (comment === undefined) {
        throw new Error("COMMENT array must not be empty");
      }
      rows.push({
        user: userId,
        cafe: cafeId,
        rating: 3 + (i % 3),
        comment,
      });
    }
  }
  return rows;
}
