/**
 * Demo Data for Platform-First Multi-Tenant SaaS
 * 
 * Hierarchy:
 * - Platform Admin (ARPDO team)
 * - Tenants (Customer companies: Cova, Apple, OneFlex)
 * - Tenant Users (Each tenant's owner + users)
 * - Workers (Federated model)
 */

import type { 
  PlatformAdmin, 
  InsertPlatformAdmin,
  Tenant,
  InsertTenant,
  User,
  InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

// ============================================
// PLATFORM ADMINS (ARPDO Team)
// ============================================

export const demoPlatformAdmins: PlatformAdmin[] = [
  {
    id: "platform-admin-1",
    email: "tahir@arpdo.com",
    password: "hashed_SecurePass123", // TODO: Hash with bcrypt
    firstName: "Tahir",
    lastName: "Çetin",
    role: "super_admin",
    lastLoginAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "platform-admin-2",
    email: "admin@arpdo.com",
    password: "hashed_AdminPass123",
    firstName: "Platform",
    lastName: "Admin",
    role: "admin",
    lastLoginAt: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
];

// ============================================
// TENANTS (Customer Companies)
// ============================================

export const demoTenants: Tenant[] = [
  // Cova B.V. - Staffing Agency
  {
    id: "tenant-cova",
    name: "Cova B.V.",
    slug: "cova-bv",
    type: "staffing_agency",
    status: "active",
    contactEmail: "info@cova.nl",
    contactPhone: "+31 40 1234567",
    plan: "professional",
    trialEndsAt: null,
    subscriptionStartsAt: new Date("2024-01-15"),
    modules: '{"workers":true,"planning":true,"accommodation":true,"transport":false,"finance":false}',
    currency: "EUR",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "platform-admin-1",
  },
  
  // Apple Netherlands - Direct Employer
  {
    id: "tenant-apple",
    name: "Apple Netherlands",
    slug: "apple-nl",
    type: "direct_employer",
    status: "trial",
    contactEmail: "hr@apple.nl",
    contactPhone: "+31 20 1234567",
    plan: "enterprise",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    subscriptionStartsAt: null,
    modules: '{"workers":true,"planning":true,"accommodation":false,"transport":true,"finance":true}',
    currency: "EUR",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-01"),
    createdBy: "platform-admin-1",
  },
  
  // OneFlex - Staffing Agency
  {
    id: "tenant-oneflex",
    name: "OneFlex B.V.",
    slug: "oneflex",
    type: "staffing_agency",
    status: "active",
    contactEmail: "contact@oneflex.nl",
    contactPhone: "+31 20 9876543",
    plan: "professional",
    trialEndsAt: null,
    subscriptionStartsAt: new Date("2024-06-01"),
    modules: '{"workers":true,"planning":true,"accommodation":true,"transport":true,"finance":false}',
    currency: "EUR",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    createdBy: "platform-admin-1",
  },
];

// ============================================
// TENANT USERS (Owners & Admins)
// ============================================

export const demoTenantUsers: User[] = [
  // Cova B.V. - Owner
  {
    id: "user-cova-owner",
    tenantId: "tenant-cova",
    email: "jan@cova.nl",
    password: "hashed_CovaPass123", // TODO: Hash with bcrypt
    firstName: "Jan",
    lastName: "de Vries",
    role: "owner",
    status: "active",
    invitedAt: new Date("2024-01-15"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-01-15"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Cova B.V. - Admin
  {
    id: "user-cova-admin",
    tenantId: "tenant-cova",
    email: "lisa@cova.nl",
    password: "hashed_LisaPass123",
    firstName: "Lisa",
    lastName: "Janssen",
    role: "admin",
    status: "active",
    invitedAt: new Date("2024-02-01"),
    invitedBy: "user-cova-owner",
    activatedAt: new Date("2024-02-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-17"),
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-17"),
  },
  
  // Apple Netherlands - Owner
  {
    id: "user-apple-owner",
    tenantId: "tenant-apple",
    email: "tim@apple.nl",
    password: "hashed_ApplePass123",
    firstName: "Tim",
    lastName: "Cook",
    role: "owner",
    status: "active",
    invitedAt: new Date("2024-10-01"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-10-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // OneFlex - Owner
  {
    id: "user-oneflex-owner",
    tenantId: "tenant-oneflex",
    email: "sophie@oneflex.nl",
    password: "hashed_OneFlexPass123",
    firstName: "Sophie",
    lastName: "van der Berg",
    role: "owner",
    status: "active",
    invitedAt: new Date("2024-06-01"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-06-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-16"),
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-10-16"),
  },
  
  // OneFlex - Invited User (Pending)
  {
    id: "user-oneflex-pending",
    tenantId: "tenant-oneflex",
    email: "mark@oneflex.nl",
    password: null,
    firstName: "Mark",
    lastName: "Peters",
    role: "user",
    status: "invited",
    invitedAt: new Date("2024-10-10"),
    invitedBy: "user-oneflex-owner",
    activatedAt: null,
    invitationToken: "invite_token_abc123",
    lastLoginAt: null,
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },
];

// ============================================
// DEMO DATA SUMMARY
// ============================================

export const demoDataSummary = {
  platformAdmins: demoPlatformAdmins.length,
  tenants: demoTenants.length,
  tenantUsers: demoTenantUsers.length,
  tenantsActive: demoTenants.filter(t => t.status === "active").length,
  tenantsTrial: demoTenants.filter(t => t.status === "trial").length,
};

console.log("📦 Demo Data Summary:", demoDataSummary);
