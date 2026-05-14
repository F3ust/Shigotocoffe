import express from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import cafeRoutes from "./routes/cafeRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
