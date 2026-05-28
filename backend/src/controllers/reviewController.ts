import { Request, Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review";
import { Cafe } from "../models/Cafe";
import { recalculateAverageRating } from "../services/reviewService";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors";

export async function createReview(req: Request, res: Response): Promise<void> {
  const { id } = req.params; // Cafe ID
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ValidationError("Invalid cafe id");
  }

  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const { rating, comment } = req.body as Record<string, unknown>;

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new ValidationError("Rating must be a number between 1 and 5");
  }

  if (typeof comment !== "string" || comment.trim() === "") {
    throw new ValidationError("Comment must be a non-empty string");
  }

  const cafeExists = await Cafe.exists({ _id: id });
  if (!cafeExists) {
    throw new NotFoundError(`Cafe not found: ${id}`);
  }

  const existingReview = await Review.findOne({ user: req.user._id, cafe: id });
  if (existingReview) {
    throw new ConflictError("You have already reviewed this cafe");
  }

  const review = await Review.create({
    user: req.user._id,
    cafe: id,
    rating,
    comment: comment.trim(),
  });

  await review.populate({ path: "user", select: "name email" });
  await recalculateAverageRating(id);

  res.status(201).json({
    status: "success",
    data: review,
  });
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  const { reviewId } = req.params;
  if (!reviewId || !mongoose.isValidObjectId(reviewId)) {
    throw new ValidationError("Invalid review id");
  }

  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const { rating, comment } = req.body as Record<string, unknown>;

  if (rating !== undefined && (typeof rating !== "number" || rating < 1 || rating > 5)) {
    throw new ValidationError("Rating must be a number between 1 and 5");
  }

  if (comment !== undefined && (typeof comment !== "string" || comment.trim() === "")) {
    throw new ValidationError("Comment must be a non-empty string");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError(`Review not found: ${reviewId}`);
  }

  if (review.user.toString() !== req.user._id) {
    throw new ForbiddenError("You are not authorized to update this review");
  }

  if (rating !== undefined) {
    review.rating = rating;
  }
  if (comment !== undefined) {
    review.comment = comment.trim();
  }

  await review.save();
  await review.populate({ path: "user", select: "name email" });
  await recalculateAverageRating(review.cafe);

  res.json({
    status: "success",
    data: review,
  });
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  const { reviewId } = req.params;
  if (!reviewId || !mongoose.isValidObjectId(reviewId)) {
    throw new ValidationError("Invalid review id");
  }

  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError(`Review not found: ${reviewId}`);
  }

  if (review.user.toString() !== req.user._id) {
    throw new ForbiddenError("You are not authorized to delete this review");
  }

  const cafeId = review.cafe;
  await Review.findByIdAndDelete(reviewId);
  await recalculateAverageRating(cafeId);

  res.status(204).send();
}
