import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ValidationError, UnauthorizedError } from "../utils/errors";

const isVercel = !!process.env.VERCEL;
const UPLOAD_DIR = isVercel
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create upload directory (expected in serverless read-only filesystem):", err);
}


const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

const upload = multer({
  storage,
  limits: {
    fileSize: isVercel ? 4 * 1024 * 1024 : 5 * 1024 * 1024, // 4MB limit on Vercel, 5MB locally
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new ValidationError("Only images (jpg, jpeg, png, gif, webp) are allowed"));
    }
  },
}).single("image");

export async function handleImageUpload(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return new Promise<void>((resolve) => {
    upload(req, res, (err: any) => {
      if (err) {
        const message = err.message || "Upload failed";
        res.status(400).json({ status: "fail", message });
        return resolve();
      }

      if (!req.file) {
        res.status(400).json({ status: "fail", message: "No image file provided" });
        return resolve();
      }

      // Return the public file URL or Base64 Data URI
      let fileUrl = "";
      if (isVercel) {
        const base64Data = req.file.buffer.toString("base64");
        fileUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      } else {
        fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }

      res.json({
        status: "success",
        data: {
          url: fileUrl,
        },
      });
      resolve();
    });
  });
}


