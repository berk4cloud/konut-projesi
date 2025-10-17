import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, integer, date, boolean, pgEnum } from "drizzle-orm/pg-core";
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

// Tenants table
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("office_staff"), // tenant_admin, admin, office_staff
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Workers table
export const workers = pgTable("workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: workerGenderEnum("gender").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  nationality: text("nationality"),
  status: workerStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

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

// Beds table
export const beds = pgTable("beds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  bedNumber: integer("bed_number").notNull(),
  status: bedStatusEnum("status").default("available"),
  lastOccupiedBy: varchar("last_occupied_by"),
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

// Reservations table
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").notNull(),
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
