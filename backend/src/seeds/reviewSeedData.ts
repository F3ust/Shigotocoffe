import { Types } from "mongoose";

export interface ReviewSeedInput {
  user: Types.ObjectId;
  cafe: Types.ObjectId;
  rating: number;
  comment: string;
}

export function buildReviewSeeds(
  cafeIds: Types.ObjectId[],
  userId: Types.ObjectId
): ReviewSeedInput[] {
  const comments = [
    "Great Wi-Fi and quiet corners for focused work.",
    "Love the outlets and no time limit policy.",
    "Perfect for remote work — will come back.",
    "Good coffee and calm atmosphere.",
    "Spacious seating and friendly staff.",
    "Ideal spot for afternoon coding sessions.",
  ];

  return cafeIds.slice(0, 6).map((cafeId, i) => ({
    user: userId,
    cafe: cafeId,
    rating: 4 + (i % 2),
    comment: comments[i % comments.length],
  }));
}
