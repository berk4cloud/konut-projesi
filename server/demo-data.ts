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
    password: "$2b$10$u4sWHn3bMnlABUZYUgTMueiodv/FCOIS2Zsq4ndM82CORfyIEFOYi", // SecurePass123
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
    password: "$2b$10$zvf1NaDn8ehyDQ5mOyMTzuU8Olb0pWE.2xTVSnie0pEN1AejxljI6", // AdminPass123
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
  // Cova B.V. - Owner (Single role)
  {
    id: "user-cova-owner",
    tenantId: "tenant-cova",
    email: "jan@cova.nl",
    password: "$2b$10$3JuG8fX.Huj3N0dRR7e/z.E0LazSCvINqehli.2Nckf0NtVA/Qxni", // CovaPass123
    firstName: "Jan",
    lastName: "de Vries",
    roles: ["owner"],
    status: "active",
    invitedAt: new Date("2024-01-15"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-01-15"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Cova B.V. - Admin (Single role)
  {
    id: "user-cova-admin",
    tenantId: "tenant-cova",
    email: "lisa@cova.nl",
    password: "$2b$10$y0Dx5e.0Hp7i.DiK9Ew6rOwMsI7kJ6YYQI9pJZNY1ceFd4GQzWqCG", // LisaPass123
    firstName: "Lisa",
    lastName: "Janssen",
    roles: ["admin"],
    status: "active",
    invitedAt: new Date("2024-02-01"),
    invitedBy: "user-cova-owner",
    activatedAt: new Date("2024-02-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-17"),
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-17"),
  },
  
  // Cova B.V. - Multi-role (Planner + Finance)
  {
    id: "user-cova-fatma",
    tenantId: "tenant-cova",
    email: "fatma@cova.nl",
    password: "$2b$10$MQ8.bBEqV4H8K9e/yO2M5.hY7i5sL6rT8uX1jW3nZ4pQ5vR7tA9uK", // FatmaPass123
    firstName: "Fatma",
    lastName: "Yılmaz",
    roles: ["planner", "finance"],
    status: "active",
    invitedAt: new Date("2024-03-01"),
    invitedBy: "user-cova-owner",
    activatedAt: new Date("2024-03-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Apple Netherlands - Owner (Single role)
  {
    id: "user-apple-owner",
    tenantId: "tenant-apple",
    email: "tim@apple.nl",
    password: "$2b$10$4vd9MwrRn9AWgM7sWyDWKOEjmopbqizhluYTIJb1HeZBJ3FYJc.xe", // ApplePass123
    firstName: "Tim",
    lastName: "Cook",
    roles: ["owner"],
    status: "active",
    invitedAt: new Date("2024-10-01"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-10-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Apple Netherlands - HR Manager (Fatma works here too!)
  {
    id: "user-apple-fatma",
    tenantId: "tenant-apple",
    email: "fatma@apple.nl",
    password: "$2b$10$MQ8.bBEqV4H8K9e/yO2M5.hY7i5sL6rT8uX1jW3nZ4pQ5vR7tA9uK", // FatmaPass123
    firstName: "Fatma",
    lastName: "Yılmaz",
    roles: ["hr_manager"],
    status: "active",
    invitedAt: new Date("2024-10-05"),
    invitedBy: "user-apple-owner",
    activatedAt: new Date("2024-10-05"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-17"),
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-17"),
  },
  
  // OneFlex - Owner (Single role)
  {
    id: "user-oneflex-owner",
    tenantId: "tenant-oneflex",
    email: "sophie@oneflex.nl",
    password: "$2b$10$SX49cSlGk/7lsJmdraD4c.NvCcTPUEkPPoJaX0vfW62gO.wIWIBAu", // OneFlexPass123
    firstName: "Sophie",
    lastName: "van der Berg",
    roles: ["owner"],
    status: "active",
    invitedAt: new Date("2024-06-01"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-06-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-16"),
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-10-16"),
  },
  
  // OneFlex - Invited Viewer (Pending)
  {
    id: "user-oneflex-pending",
    tenantId: "tenant-oneflex",
    email: "mark@oneflex.nl",
    password: null,
    firstName: "Mark",
    lastName: "Peters",
    roles: ["viewer"],
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
// Login Scenarios:
// 1. Jan (jan@cova.nl) - Single tenant + Single role → Direct dashboard
// 2. Lisa (lisa@cova.nl) - Single tenant + Single role → Direct dashboard
// 3. Fatma (fatma@cova.nl OR fatma@apple.nl) - Multi tenant + Multi role → Tenant select → Role select
// 4. Tim (tim@apple.nl) - Single tenant + Single role → Direct dashboard
// 5. Sophie (sophie@oneflex.nl) - Single tenant + Single role → Direct dashboard

export const demoDataSummary = {
  platformAdmins: demoPlatformAdmins.length,
  tenants: demoTenants.length,
  tenantUsers: demoTenantUsers.length,
  uniqueUsers: new Set(demoTenantUsers.map(u => u.email)).size, // 6 unique emails (Fatma has 2 records)
  multiRoleUsers: demoTenantUsers.filter(u => u.roles.length > 1).length, // 1 (Fatma @ Cova)
  multiTenantUsers: 1, // 1 (Fatma works at both Cova and Apple)
  tenantsActive: demoTenants.filter(t => t.status === "active").length,
  tenantsTrial: demoTenants.filter(t => t.status === "trial").length,
};

console.log("📦 Demo Data Summary:", demoDataSummary);
