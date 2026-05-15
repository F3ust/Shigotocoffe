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

/** One seeded review per café from the demo user (unique user+cafe in Review). */
export function buildReviewSeeds(
  cafeIds: Types.ObjectId[],
  userId: Types.ObjectId
): ReviewSeedInput[] {
  const rows: ReviewSeedInput[] = [];
  for (let idx = 0; idx < cafeIds.length; idx++) {
    const cafeId = cafeIds[idx]!;
    const comment = COMMENTS[idx % COMMENTS.length];
    if (comment === undefined) {
      throw new Error("COMMENTS must not be empty");
    }
    rows.push({
      user: userId,
      cafe: cafeId,
      rating: 3 + (idx % 3),
      comment,
    });
  }
  return rows;
}
