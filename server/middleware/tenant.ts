/**
 * Multi-Tenant Middleware
 * 
 * Detects tenant from subdomain and loads tenant context
 * Example: cova-bv.arpdo.com → tenant slug = "cova-bv"
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { Tenant } from "@shared/schema";

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantSlug?: string;
    }
  }
}

/**
 * Extract tenant slug from hostname
 * 
 * Examples:
 * - cova-bv.arpdo.com → "cova-bv"
 * - localhost:5000 → null (local dev)
 * - 127.0.0.1:5000 → null (local dev)
 * - arpdo.com → null (root domain, platform admin)
 */
export function extractTenantSlug(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Local development (no subdomain)
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
    return null;
  }
  
  // Check if it's a subdomain
  const parts = host.split('.');
  
  // Root domain (arpdo.com or just domain without subdomain)
  if (parts.length <= 2) {
    return null;
  }
  
  // Extract subdomain (first part)
  const subdomain = parts[0];
  
  // Reserved subdomains for platform use
  const reservedSubdomains = ['www', 'api', 'admin', 'platform', 'app'];
  if (reservedSubdomains.includes(subdomain)) {
    return null;
  }
  
  return subdomain;
}

/**
 * Middleware: Detect tenant slug from subdomain
 * 
 * Attaches req.tenantSlug if subdomain detected
 */
export function detectTenantSlug(req: Request, res: Response, next: NextFunction) {
  const hostname = req.hostname || req.get('host') || '';
  const slug = extractTenantSlug(hostname);
  
  if (slug) {
    req.tenantSlug = slug;
  }
  
  next();
}

/**
 * Middleware: Load tenant by slug
 * 
 * If req.tenantSlug exists, loads tenant from database
 * Returns 404 if tenant not found
 * 
 * Use this middleware on routes that REQUIRE a tenant context
 */
export async function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenantSlug) {
    return res.status(400).json({ 
      error: "Tenant context required",
      message: "Bu sayfa tenant subdomain gerektirir (örn: cova-bv.arpdo.com)"
    });
  }
  
  try {
    const tenant = await storage.getTenantBySlug(req.tenantSlug);
    
    if (!tenant) {
      return res.status(404).json({ 
        error: "Tenant not found",
        message: `Tenant '${req.tenantSlug}' bulunamadı`
      });
    }
    
    // Check if tenant is suspended
    if (tenant.status === 'suspended') {
      return res.status(403).json({ 
        error: "Tenant suspended",
        message: "Bu şirket hesabı askıya alınmış"
      });
    }
    
    // Check if tenant is cancelled
    if (tenant.status === 'cancelled') {
      return res.status(410).json({ 
        error: "Tenant cancelled",
        message: "Bu şirket hesabı iptal edilmiş"
      });
    }
    
    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error("Error loading tenant:", error);
    res.status(500).json({ 
      error: "Failed to load tenant",
      message: "Tenant yüklenirken hata oluştu"
    });
  }
}

/**
 * Middleware: Optionally load tenant
 * 
 * Like requireTenant but doesn't fail if no tenant slug
 * Useful for routes that work with or without tenant context
 */
export async function optionalTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenantSlug) {
    return next();
  }
  
  try {
    const tenant = await storage.getTenantBySlug(req.tenantSlug);
    if (tenant) {
      req.tenant = tenant;
    }
    next();
  } catch (error) {
    console.error("Error loading optional tenant:", error);
    // Don't fail, just continue without tenant
    next();
  }
}
