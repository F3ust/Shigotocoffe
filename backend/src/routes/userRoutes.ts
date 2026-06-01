import { Router } from "express";
import {
  getProfile,
  updateProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/me", authMiddleware, asyncHandler(getProfile));
router.patch("/me", authMiddleware, asyncHandler(updateProfile));

// Favorites/Bookmark Endpoints
router.get("/favorites", authMiddleware, asyncHandler(getFavorites));
router.post("/favorites/:cafeId", authMiddleware, asyncHandler(addFavorite));
router.delete("/favorites/:cafeId", authMiddleware, asyncHandler(removeFavorite));

export default router;

