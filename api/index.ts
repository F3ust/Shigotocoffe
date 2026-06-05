import { connectDB } from "../backend/src/config/db";
import app from "../backend/src/app";

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failed in serverless handler:", err);
  }
  return app(req, res);
}
