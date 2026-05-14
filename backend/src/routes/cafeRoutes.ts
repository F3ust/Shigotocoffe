import { Router } from "express";
import { getCafes, getCafeById, createCafe, updateCafe, deleteCafe } from "../controllers/cafeController";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getCafes));
router.post("/", asyncHandler(createCafe));
router.get("/:id", asyncHandler(getCafeById));
router.patch("/:id", asyncHandler(updateCafe));
router.delete("/:id", asyncHandler(deleteCafe));

export default router;
