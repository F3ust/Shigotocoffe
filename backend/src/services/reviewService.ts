import mongoose from "mongoose";
import { Review } from "../models/Review";
import { Cafe } from "../models/Cafe";

export async function recalculateAverageRating(
  cafeId: string | mongoose.Types.ObjectId
): Promise<void> {
  const targetId = typeof cafeId === "string" ? new mongoose.Types.ObjectId(cafeId) : cafeId;

  const stats = await Review.aggregate([
    { $match: { cafe: targetId } },
    {
      $group: {
        _id: "$cafe",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const { averageRating, reviewCount } = stats[0] as {
      averageRating: number;
      reviewCount: number;
    };
    await Cafe.findByIdAndUpdate(targetId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
    });
  } else {
    await Cafe.findByIdAndUpdate(targetId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
}
