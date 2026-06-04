import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import cafeRoutes from "./routes/cafeRoutes";
import authRoutes from "./routes/authRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const DB_STATE_LABELS: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

app.get("/api/health", (_req, res) => {
  const readyState = mongoose.connection.readyState;
  const connected = readyState === 1;
  const state = DB_STATE_LABELS[readyState] ?? "unknown";
  res.json({
    status: connected ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: { connected, state },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.use(errorHandler);

export default app;
