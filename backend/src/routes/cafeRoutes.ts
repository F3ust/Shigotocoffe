import { Router } from "express";
import { getCafes, getCafeById } from "../controllers/cafeController";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getCafes));
router.get("/:id", asyncHandler(getCafeById));

export default router;
