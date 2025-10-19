import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../auth";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tenantId?: string;
        role: string;
        type: "platform_admin" | "tenant_user";
      };
    }
  }
}

export function authenticateTenantUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  // Attach user info to request
  if (decoded.type === "tenant_user") {
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role,
      type: "tenant_user",
    };
  } else if (decoded.type === "platform_admin") {
    req.user = {
      id: decoded.adminId,
      email: decoded.email,
      role: "platform_admin",
      type: "platform_admin",
    };
  } else {
    return res.status(401).json({ error: "Unauthorized: Invalid token type" });
  }

  next();
}

// Optional middleware for routes that allow both authenticated and public access
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded) {
      if (decoded.type === "tenant_user") {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          tenantId: decoded.tenantId,
          role: decoded.role,
          type: "tenant_user",
        };
      } else if (decoded.type === "platform_admin") {
        req.user = {
          id: decoded.adminId,
          email: decoded.email,
          role: "platform_admin",
          type: "platform_admin",
        };
      }
    }
  }

  next();
}
