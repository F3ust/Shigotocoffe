import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ValidationError, UnauthorizedError } from "../utils/errors";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

      // Return the public file URL
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
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

