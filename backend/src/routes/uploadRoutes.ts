import { Router } from "express";
import { handleImageUpload } from "../controllers/uploadController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/", authMiddleware, asyncHandler(handleImageUpload));

export default router;
