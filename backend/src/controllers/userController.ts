import { Request, Response } from "express";
import { User } from "../models/User";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "../utils/errors";

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const user = await User.findById(req.user._id).select("-password").lean();
  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    status: "success",
    data: user,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const { name, email } = req.body as Record<string, unknown>;

  const updates: Record<string, string> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new ValidationError("Name must be a non-empty string");
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || email.trim() === "") {
      throw new ValidationError("Email must be a non-empty string");
    }
    const cleanEmail = email.trim().toLowerCase();
    
    // Simple email format check
    if (!cleanEmail.includes("@")) {
      throw new ValidationError("Email format is invalid");
    }

    // Check if email is already taken by someone else
    const emailTaken = await User.findOne({
      email: cleanEmail,
      _id: { $ne: req.user._id },
    });
    if (emailTaken) {
      throw new ConflictError("Email already taken");
    }
    updates.email = cleanEmail;
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError("At least one field (name or email) must be provided");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    status: "success",
    data: user,
  });
}
