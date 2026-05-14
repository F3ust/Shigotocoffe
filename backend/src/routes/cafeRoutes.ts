import { Router } from "express";
import { getCafes, getCafeById, createCafe } from "../controllers/cafeController";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getCafes));
router.post("/", asyncHandler(createCafe));
router.get("/:id", asyncHandler(getCafeById));

export default router;
