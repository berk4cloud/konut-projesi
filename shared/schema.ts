import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, integer, date, boolean, pgEnum, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const bedStatusEnum = pgEnum("bed_status", ["available", "occupied", "reserved", "out_of_service"]);
export const ownershipTypeEnum = pgEnum("ownership_type", ["rent", "owned"]);
export const houseStatusEnum = pgEnum("house_status", ["active", "inactive", "maintenance"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]);
export const roomTypeEnum = pgEnum("room_type", ["single", "double", "triple", "quad", "dormitory"]);
export const genderRestrictionEnum = pgEnum("gender_restriction", ["male", "female", "mixed", "none"]);
export const workerGenderEnum = pgEnum("worker_gender", ["male", "female"]);
export const workerStatusEnum = pgEnum("worker_status", ["active", "inactive", "new_registration", "checked_out"]);
export const employmentStatusEnum = pgEnum("employment_status", ["active", "inactive", "former", "invited"]);
export const currencyEnum = pgEnum("currency", [
  "EUR", "USD", "TRY", "GBP", "CHF", "CAD", "MXN", "CNY", "JPY",
  "RUB", "SEK", "NOK", "DKK", "HUF", "PLN", "CZK", "RON", "BGN", "RSD", "UAH"
]);

// Platform-level enums
export const platformAdminRoleEnum = pgEnum("platform_admin_role", ["super_admin", "admin", "support"]);
export const tenantTypeEnum = pgEnum("tenant_type", ["direct_employer", "staffing_agency"]);
export const tenantStatusEnum = pgEnum("tenant_status", ["trial", "active", "suspended", "cancelled"]);
export const tenantPlanEnum = pgEnum("tenant_plan", ["basic", "professional", "enterprise"]);
export const tenantUserStatusEnum = pgEnum("tenant_user_status", ["invited", "active", "inactive"]);

// Role enums for multi-role system
export const tenantRoleEnum = pgEnum("tenant_role", [
  "owner",
  "admin", 
  "hr_manager",
  "planner",
  "accommodation_manager",
  "transport_manager",
  "finance",
  "viewer"
]);

// ============================================
// PLATFORM LEVEL (SAAS)
// ============================================

// Platform Admins table (ARPDO team)
export const platformAdmins = pgTable("platform_admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: platformAdminRoleEnum("role").default("admin").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlatformAdminSchema = createInsertSchema(platformAdmins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});
export type InsertPlatformAdmin = z.infer<typeof insertPlatformAdminSchema>;
export type PlatformAdmin = typeof platformAdmins.$inferSelect;

// Tenants table (Customer companies)
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // For subdomain: cova-bv.arpdo.com
  type: tenantTypeEnum("type").default("staffing_agency").notNull(),
  status: tenantStatusEnum("status").default("trial").notNull(),
  
  // Contact info
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  
  // Subscription
  plan: tenantPlanEnum("plan").default("professional").notNull(),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionStartsAt: timestamp("subscription_starts_at"),
  
  // Feature flags (which modules are enabled)
  modules: jsonb("modules").default(sql`'{"workers":true,"planning":false,"accommodation":false,"transport":false,"finance":false}'::jsonb`).notNull(),
  
  // Settings
  currency: currencyEnum("currency").default("EUR").notNull(),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"), // Platform admin who created this tenant
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// ============================================
// TENANT LEVEL
// ============================================

// Tenant Users table (Each tenant's users)
// Note: A user can exist in multiple tenants (same email, different tenantId records)
// Each tenant-user relationship can have multiple roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  
  email: text("email").notNull(),
  password: text("password"), // Null if invited but not activated
  
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  
  // Multi-role support: User can have multiple roles in same tenant
  roles: text("roles").array().notNull().default(sql`ARRAY['viewer']::text[]`),
  
  status: tenantUserStatusEnum("status").default("invited").notNull(),
  
  // Invitation flow
  invitedAt: timestamp("invited_at"),
  invitedBy: varchar("invited_by"), // User ID or Platform Admin ID
  activatedAt: timestamp("activated_at"),
  invitationToken: text("invitation_token"),
  
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Ensure email is unique per tenant
  tenantEmailUnique: unique().on(table.tenantId, table.email),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Preferences table (for login flow - remembering last selections)
// Stores per-email preferences across all tenants
export const userPreferences = pgTable("user_preferences", {
  email: text("email").primaryKey(), // Email as primary key (global)
  lastTenantId: varchar("last_tenant_id"), // Last selected tenant
  lastSelections: jsonb("last_selections").default(sql`'{}'::jsonb`), // {"tenant-id": "role"}
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  updatedAt: true,
});
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

// ============================================
// FEDERATED WORKER IDENTITY MODEL
// ============================================

// Worker Profiles table (Global - Worker owned)
// This table contains the portable worker identity that moves across tenants
export const workerProfiles = pgTable("worker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(), // Used for login
  password: text("password"), // For worker authentication
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: workerGenderEnum("gender").notNull(),
  phone: text("phone"),
  nationality: text("nationality"),
  dateOfBirth: date("date_of_birth"),
  photo: text("photo"), // Profile photo URL
  bio: text("bio"), // Worker's biography
  address: text("address"), // Personal address
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkerProfileSchema = createInsertSchema(workerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;
export type WorkerProfile = typeof workerProfiles.$inferSelect;

// Employments table (Tenant-specific - Links worker to company)
// This table represents the employment relationship between worker and tenant
export const employments = pgTable("employments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerProfileId: varchar("worker_profile_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  status: employmentStatusEnum("status").default("active"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null if still employed
  
  // Snapshot fields (copied from profile at employment start)
  // Preserved even if worker updates their profile later
  snapshotGender: workerGenderEnum("snapshot_gender").notNull(),
  snapshotPhoto: text("snapshot_photo"),
  snapshotFirstName: text("snapshot_first_name").notNull(),
  snapshotLastName: text("snapshot_last_name").notNull(),
  
  jobTitle: text("job_title"), // e.g., "Cleaner", "Warehouse Worker"
  department: text("department"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"), // User who created this employment
});

export const insertEmploymentSchema = createInsertSchema(employments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmployment = z.infer<typeof insertEmploymentSchema>;
export type Employment = typeof employments.$inferSelect;

// Employment Private Data table (Tenant-specific - Sensitive data)
// This table contains sensitive employment data that is NEVER shared across tenants
export const employmentPrivateData = pgTable("employment_private_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employmentId: varchar("employment_id").notNull().unique(),
  
  // Compensation
  salary: numeric("salary"),
  salaryFrequency: text("salary_frequency"), // "hourly", "monthly", "yearly"
  currency: currencyEnum("currency").default("EUR"),
  
  // Contract
  contractType: text("contract_type"), // "full_time", "part_time", "temporary", "seasonal"
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  
  // Internal notes (never visible to worker)
  internalNotes: text("internal_notes"),
  performanceRating: numeric("performance_rating"), // 1-5 scale
  
  // Manager/supervisor
  managerId: varchar("manager_id"), // Reference to users table
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmploymentPrivateDataSchema = createInsertSchema(employmentPrivateData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmploymentPrivateData = z.infer<typeof insertEmploymentPrivateDataSchema>;
export type EmploymentPrivateData = typeof employmentPrivateData.$inferSelect;

// Houses table
export const houses = pgTable("houses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  houseNumber: text("house_number"),
  houseNumberAddition: text("house_number_addition"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  totalRooms: integer("total_rooms").default(0),
  totalBeds: integer("total_beds").default(0),
  costPerWeek: numeric("cost_per_week"),
  costPerBedPerDay: numeric("cost_per_bed_per_day"),
  ownershipType: ownershipTypeEnum("ownership_type"),
  status: houseStatusEnum("status").default("active"),
  description: text("description"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHouseSchema = createInsertSchema(houses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHouse = z.infer<typeof insertHouseSchema>;
export type House = typeof houses.$inferSelect;

// Rooms table
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  houseId: varchar("house_id").notNull(),
  roomNumber: text("room_number").notNull(),
  floor: integer("floor"),
  roomType: roomTypeEnum("room_type"),
  bedCount: integer("bed_count").default(0),
  genderRestriction: genderRestrictionEnum("gender_restriction").default("none"),
  isFamilyRoom: boolean("is_family_room").default(false),
  status: text("status").default("active"),
  costPerDay: numeric("cost_per_day"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

// Beds table (Updated for Federated Model)
export const beds = pgTable("beds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  bedNumber: integer("bed_number").notNull(),
  status: bedStatusEnum("status").default("available"),
  lastOccupiedBy: varchar("last_occupied_by"), // References employmentId
  lastOccupiedAt: timestamp("last_occupied_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBedSchema = createInsertSchema(beds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBed = z.infer<typeof insertBedSchema>;
export type Bed = typeof beds.$inferSelect;

// Reservations table (Updated for Federated Model)
// Now references employmentId instead of workerId
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employmentId: varchar("employment_id").notNull(), // Changed from workerId
  houseId: varchar("house_id").notNull(),
  roomId: varchar("room_id").notNull(),
  bedId: varchar("bed_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  status: reservationStatusEnum("status").default("pending"),
  dailyRate: numeric("daily_rate"),
  totalCost: numeric("total_cost"),
  onVacation: boolean("on_vacation").default(false),
  belongingsInRoom: boolean("belongings_in_room").default(false),
  description: text("description"),
  internalNotes: text("internal_notes"),
  confirmedBy: varchar("confirmed_by"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"),
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;
