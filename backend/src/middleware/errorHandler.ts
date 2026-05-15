import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/errors";
import { config } from "../config";

function isMongoConnectivityError(err: unknown): boolean {
  if (err instanceof mongoose.Error.MongooseServerSelectionError) return true;
  if (err instanceof mongoose.mongo.MongoNetworkError) return true;
  if (typeof err !== "object" || err === null) return false;
  const name = (err as { name?: string }).name;
  return (
    name === "MongoServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoNotConnectedError"
  );
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...("errors" in err ? { errors: (err as { errors?: unknown }).errors } : {}),
    });
    return;
  }

  if (isMongoConnectivityError(err)) {
    console.error("Database unavailable:", err);
    const message =
      config.nodeEnv === "production"
        ? "Service temporarily unavailable"
        : "Database unavailable. Start MongoDB (docker compose -p shigoto-coffee up -d), check MONGODB_URI in .env, then npm run seed in backend.";
    res.status(503).json({ status: "error", message });
    return;
  }

  console.error("Unhandled error:", err);

  const message =
    config.nodeEnv === "production" ? "Internal server error" : err.message;

  res.status(500).json({
    status: "error",
    message,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
