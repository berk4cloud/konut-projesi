import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, integer, date, boolean, pgEnum, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { DateTime } from "luxon";

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
export const qrCodeTypeEnum = pgEnum("qr_code_type", ["worker_registration", "meter_reading", "document_upload"]);
export const qrCodeStatusEnum = pgEnum("qr_code_status", ["active", "disabled", "expired"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["active", "ending_soon", "ended"]);
export const depositStatusEnum = pgEnum("deposit_status", ["pending", "collected", "refunded", "partially_refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "partial", "paid", "overdue"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bank_transfer", "pos", "other"]);
export const chargeCalculationTypeEnum = pgEnum("charge_calculation_type", ["full_month", "partial", "prorated"]);

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

// Countries table (Global reference data - managed by platform)
// Contains all countries with translations in 7 languages
export const countries = pgTable("countries", {
  isoCode: varchar("iso_code", { length: 2 }).primaryKey(), // ISO 3166-1 alpha-2 (e.g., "DE", "NL", "TR")
  nameTr: text("name_tr").notNull(), // Turkish
  nameEn: text("name_en").notNull(), // English
  nameDe: text("name_de").notNull(), // German
  nameNl: text("name_nl").notNull(), // Dutch
  nameFr: text("name_fr").notNull(), // French
  namePl: text("name_pl").notNull(), // Polish
  nameBg: text("name_bg").notNull(), // Bulgarian
  flagEmoji: text("flag_emoji"), // e.g., "🇩🇪", "🇳🇱"
  phoneCode: text("phone_code"), // e.g., "+49", "+31"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

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
  timezone: text("timezone").default("UTC").notNull(), // IANA timezone string, e.g., "Europe/Amsterdam", "America/New_York"
  pricingSettings: jsonb("pricing_settings").default(sql`'{"dailyRentalEnabled":false,"standardPricing":{"bedDailyPrice":25,"bedMonthlyPrice":600,"roomDailyPrice":70,"roomMonthlyPrice":1700}}'::jsonb`).notNull(),
  
  // Country Management
  favoriteCountries: text("favorite_countries").array().default(sql`ARRAY[]::text[]`), // ISO codes array, e.g., ["DE", "NL", "PL"]
  defaultCountry: varchar("default_country", { length: 2 }), // ISO code, e.g., "DE"
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"), // Platform admin who created this tenant
});

export const insertTenantSchema = createInsertSchema(tenants)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .transform((data) => ({
    ...data,
    // Normalize timezone: trim whitespace, convert empty string to undefined
    timezone: data.timezone && typeof data.timezone === 'string' 
      ? (data.timezone.trim() || undefined)
      : data.timezone
  }))
  .refine(
    (data) => {
      // If timezone is provided, validate it's a valid IANA timezone
      if (!data.timezone || typeof data.timezone !== 'string') return true; // Will use default "UTC"
      // Already trimmed by transform, validate as-is
      return DateTime.now().setZone(data.timezone).isValid;
    },
    {
      message: "Invalid IANA timezone string. Use format like 'Europe/Amsterdam' or 'America/New_York'",
      path: ["timezone"],
    }
  );
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
  notes: text("notes").array().default(sql`ARRAY[]::text[]`), // Array of checkout/reservation notes
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

// QR Codes table for task delegation system
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  type: qrCodeTypeEnum("type").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  title: text("title").notNull(),
  status: qrCodeStatusEnum("status").notNull().default("active"),
  usageLimit: integer("usage_limit"), // null = unlimited
  usedCount: integer("used_count").notNull().default(0),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
});

export const insertQRCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true,
  usedCount: true,
});
export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;
export type QRCode = typeof qrCodes.$inferSelect;

// ============================================
// ASSIGNMENT MANAGEMENT SYSTEM
// ============================================

// Assignments table - Worker-to-bed assignments (active accommodation)
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  employmentId: varchar("employment_id").notNull(),
  houseId: varchar("house_id").notNull(),
  roomId: varchar("room_id").notNull(),
  bedId: varchar("bed_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  monthlyRate: numeric("monthly_rate", { mode: "number" }).notNull(),
  status: assignmentStatusEnum("status").notNull().default("active"),
  
  // Deposit tracking
  depositCollected: boolean("deposit_collected").default(false).notNull(),
  depositAmount: numeric("deposit_amount", { mode: "number" }).default("0"),
  depositDate: date("deposit_date"),
  depositCollector: varchar("deposit_collector"),
  depositStatus: depositStatusEnum("deposit_status").default("pending").notNull(),
  depositRefundDate: date("deposit_refund_date"),
  depositRefundAmount: numeric("deposit_refund_amount", { mode: "number" }),
  damageAmount: numeric("damage_amount", { mode: "number" }),
  damageNote: text("damage_note"),
  
  // Agreement notes
  agreementNotes: text("agreement_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;

// Charges table - Monthly accommodation charges
export const charges = pgTable("charges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  assignmentId: varchar("assignment_id").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "2025-11" format
  amount: numeric("amount", { mode: "number" }).notNull(), // Total charge
  expectedAmount: numeric("expected_amount", { mode: "number" }).notNull(),
  remainingAmount: numeric("remaining_amount", { mode: "number" }).notNull(),
  days: integer("days").notNull(), // Number of days in charge period
  calculationType: chargeCalculationTypeEnum("calculation_type").notNull(),
  dueDate: date("due_date").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChargeSchema = createInsertSchema(charges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCharge = z.infer<typeof insertChargeSchema>;
export type Charge = typeof charges.$inferSelect;

// Payments table - Payment records for charges
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  chargeId: varchar("charge_id").notNull(),
  amount: numeric("amount", { mode: "number" }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  collectorName: varchar("collector_name"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  reference: varchar("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  recordedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Extended types with computed fields for frontend display
export type AssignmentWithDetails = Assignment & {
  workerName: string;
  houseName: string;
  roomNumber: string;
  bedNumber: number;
};

export type ChargeWithWorker = Charge & {
  workerName: string;
};

export type PaymentWithWorker = Payment & {
  workerName: string;
};

// Assignment Notes table - Conversation/activity notes for assignments
export const assignmentNotes = pgTable("assignment_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  assignmentId: varchar("assignment_id").notNull(),
  note: text("note").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssignmentNoteSchema = createInsertSchema(assignmentNotes).omit({
  id: true,
  createdAt: true,
});
export type InsertAssignmentNote = z.infer<typeof insertAssignmentNoteSchema>;
export type AssignmentNote = typeof assignmentNotes.$inferSelect;
