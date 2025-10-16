import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "apdo-habitat-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    email: string;
  };
}

export function generateToken(userId: string, tenantId: string, email: string): string {
  return jwt.sign(
    { id: userId, tenantId, email },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      tenantId: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function checkTenant(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Add tenant check logic if needed
  next();
}
