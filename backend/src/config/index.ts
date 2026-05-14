import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

interface AppConfig {
  port: number;
  mongodbUri: string;
  nodeEnv: string;
  corsOrigin: string;
}

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: AppConfig = {
  port: parseInt(requireEnv("BACKEND_PORT", "5000"), 10),
  mongodbUri: requireEnv(
    "MONGODB_URI",
    "mongodb://admin:admin123@localhost:27017/shigoto_coffee?authSource=admin"
  ),
  nodeEnv: requireEnv("NODE_ENV", "development"),
  corsOrigin: requireEnv("CORS_ORIGIN", "http://localhost:5173"),
};
