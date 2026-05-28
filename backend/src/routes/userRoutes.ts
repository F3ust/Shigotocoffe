import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/me", authMiddleware, asyncHandler(getProfile));
router.patch("/me", authMiddleware, asyncHandler(updateProfile));

export default router;
