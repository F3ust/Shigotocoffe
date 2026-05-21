import { Router } from "express";
import {
  getCafes,
  getCafeById,
  getCafeReviews,
  createCafe,
  updateCafe,
  deleteCafe,
} from "../controllers/cafeController";
import { asyncHandler } from "../middleware/errorHandler";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getCafes));
router.post("/", authMiddleware, requireRole("owner"), asyncHandler(createCafe));
router.get("/:id/reviews", asyncHandler(getCafeReviews));
router.get("/:id", asyncHandler(getCafeById));
router.patch("/:id", authMiddleware, requireRole("owner"), asyncHandler(updateCafe));
router.delete("/:id", authMiddleware, requireRole("owner"), asyncHandler(deleteCafe));

export default router;

