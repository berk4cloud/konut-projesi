import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const bedStatusEnum = pgEnum("bed_status", ["available", "occupied", "reserved", "oos"]);
export const roomTypeEnum = pgEnum("room_type", ["standard", "family", "single", "shared", "suite"]);
export const genderRestrictionEnum = pgEnum("gender_restriction", ["male_only", "female_only", "family_only", "mixed"]);
export const ownershipTypeEnum = pgEnum("ownership_type", ["owned", "rented", "third_party"]);
export const houseStatusEnum = pgEnum("house_status", ["active", "inactive", "maintenance"]);
export const workerStatusEnum = pgEnum("worker_status", ["active", "inactive", "blocked"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]);

// Tenants
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users (tenant admins)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Houses
export const houses = pgTable("houses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  houseNumber: text("house_number").notNull(),
  houseNumberAddition: text("house_number_addition"),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  country: text("country").default("NL").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  totalRooms: integer("total_rooms").notNull(),
  totalBeds: integer("total_beds").notNull(),
  costPerWeek: decimal("cost_per_week", { precision: 10, scale: 2 }),
  costPerBedPerDay: decimal("cost_per_bed_per_day", { precision: 10, scale: 2 }),
  ownershipType: ownershipTypeEnum("ownership_type").default("owned").notNull(),
  status: houseStatusEnum("status").default("active").notNull(),
  description: text("description"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rooms
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  houseId: varchar("house_id").references(() => houses.id, { onDelete: "cascade" }).notNull(),
  roomNumber: text("room_number").notNull(),
  floor: integer("floor"),
  roomType: roomTypeEnum("room_type").default("standard").notNull(),
  bedCount: integer("bed_count").notNull(),
  genderRestriction: genderRestrictionEnum("gender_restriction"),
  isFamilyRoom: boolean("is_family_room").default(false).notNull(),
  status: text("status").default("available").notNull(),
  costPerDay: decimal("cost_per_day", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Beds
export const beds = pgTable("beds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  bedNumber: integer("bed_number").notNull(),
  status: bedStatusEnum("status").default("available").notNull(),
  lastOccupiedBy: varchar("last_occupied_by"),
  lastOccupiedAt: timestamp("last_occupied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workers
export const workers = pgTable("workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: genderEnum("gender").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  nationality: text("nationality"),
  status: workerStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reservations
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").references(() => workers.id, { onDelete: "cascade" }).notNull(),
  houseId: varchar("house_id").references(() => houses.id, { onDelete: "cascade" }).notNull(),
  roomId: varchar("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  bedId: varchar("bed_id").references(() => beds.id, { onDelete: "cascade" }).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  status: reservationStatusEnum("status").default("pending").notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  onVacation: boolean("on_vacation").default(false).notNull(),
  belongingsInRoom: boolean("belongings_in_room").default(false).notNull(),
  description: text("description"),
  internalNotes: text("internal_notes"),
  confirmedBy: varchar("confirmed_by"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  houses: many(houses),
  workers: many(workers),
  reservations: many(reservations),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const housesRelations = relations(houses, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [houses.tenantId],
    references: [tenants.id],
  }),
  rooms: many(rooms),
  reservations: many(reservations),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  house: one(houses, {
    fields: [rooms.houseId],
    references: [houses.id],
  }),
  beds: many(beds),
  reservations: many(reservations),
}));

export const bedsRelations = relations(beds, ({ one, many }) => ({
  room: one(rooms, {
    fields: [beds.roomId],
    references: [rooms.id],
  }),
  reservations: many(reservations),
}));

export const workersRelations = relations(workers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [workers.tenantId],
    references: [tenants.id],
  }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  worker: one(workers, {
    fields: [reservations.workerId],
    references: [workers.id],
  }),
  house: one(houses, {
    fields: [reservations.houseId],
    references: [houses.id],
  }),
  room: one(rooms, {
    fields: [reservations.roomId],
    references: [rooms.id],
  }),
  bed: one(beds, {
    fields: [reservations.bedId],
    references: [beds.id],
  }),
  tenant: one(tenants, {
    fields: [reservations.tenantId],
    references: [tenants.id],
  }),
}));

// Insert Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHouseSchema = createInsertSchema(houses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBedSchema = createInsertSchema(beds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type House = typeof houses.$inferSelect;
export type InsertHouse = z.infer<typeof insertHouseSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Bed = typeof beds.$inferSelect;
export type InsertBed = z.infer<typeof insertBedSchema>;

export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
