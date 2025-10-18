/**
 * Authentication utilities for multi-tenant platform
 * Supports both Platform Admin and Tenant User authentication
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { PlatformAdmin, User, Tenant } from "@shared/schema";

// JWT secret from environment or default (CHANGE IN PRODUCTION!)
const JWT_SECRET = process.env.JWT_SECRET || "ARPDO_HABITAT_DEV_SECRET_CHANGE_IN_PRODUCTION";
const JWT_EXPIRY = "7d"; // 7 days

// ============================================
// PASSWORD VERIFICATION
// ============================================

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// ============================================
// JWT TOKEN GENERATION
// ============================================

// Platform Admin JWT payload
export interface PlatformAdminJwtPayload {
  type: "platform_admin";
  adminId: string;
  email: string;
  role: string;
}

// Tenant User JWT payload
export interface TenantUserJwtPayload {
  type: "tenant_user";
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export type JwtPayload = PlatformAdminJwtPayload | TenantUserJwtPayload;

export function generatePlatformAdminToken(admin: PlatformAdmin): string {
  const payload: PlatformAdminJwtPayload = {
    type: "platform_admin",
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function generateTenantUserToken(user: User, tenant: Tenant, selectedRole: string): string {
  const payload: TenantUserJwtPayload = {
    type: "tenant_user",
    userId: user.id,
    tenantId: tenant.id,
    email: user.email,
    role: selectedRole, // User can have multiple roles, this is the currently selected one
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
