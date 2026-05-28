import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { login, register, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", authMiddleware, asyncHandler(logout));

export default router;
