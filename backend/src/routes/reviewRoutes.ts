import { Router } from "express";
import { updateReview, deleteReview, replyToReview } from "../controllers/reviewController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.patch("/:reviewId", authMiddleware, asyncHandler(updateReview));
router.delete("/:reviewId", authMiddleware, asyncHandler(deleteReview));
router.post("/:reviewId/reply", authMiddleware, asyncHandler(replyToReview));

export default router;
