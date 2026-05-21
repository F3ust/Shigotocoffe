import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

export interface UserPayload {
  _id: string;
  role: "user" | "owner";
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      role: "user" | "owner";
    };

    req.user = {
      _id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireRole(role: "user" | "owner") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }
    if (req.user.role !== role) {
      throw new ForbiddenError(`Requires "${role}" role`);
    }
    next();
  };
}
