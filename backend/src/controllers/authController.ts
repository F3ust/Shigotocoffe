import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";

const SALT_ROUNDS = 10;

function assertBodyString(
  body: Record<string, unknown>,
  field: string
): string {
  const v = body[field];
  if (typeof v !== "string" || v.trim() === "") {
    throw new ValidationError(`"${field}" must be a non-empty string`);
  }
  return v.trim();
}

function parseRole(body: Record<string, unknown>): "user" | "owner" {
  const raw = body.role;
  if (raw === undefined || raw === null || raw === "") return "user";
  if (typeof raw !== "string") {
    throw new ValidationError('"role" must be a string');
  }
  const role = raw.trim().toLowerCase();
  if (role === "user" || role === "owner") return role;
  throw new ValidationError('"role" must be "user" or "owner"');
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const name = assertBodyString(body, "name");
  const email = assertBodyString(body, "email").toLowerCase();
  const password = assertBodyString(body, "password");
  const role = parseRole(body);

  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: hash,
    role,
  });

  const signOptions = {
    expiresIn: config.jwtExpiresIn,
  } as SignOptions;

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    config.jwtSecret,
    signOptions
  );

  res.status(201).json({
    status: "success",
    data: {
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const email = assertBodyString(body, "email").toLowerCase();
  const password = assertBodyString(body, "password");

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const signOptions = {
    expiresIn: config.jwtExpiresIn,
  } as SignOptions;

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    config.jwtSecret,
    signOptions
  );

  res.json({
    status: "success",
    data: {
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
}
