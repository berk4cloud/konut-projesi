import { 
  type User, 
  type InsertUser,
  type Tenant,
  type InsertTenant,
  type PlatformAdmin,
  type InsertPlatformAdmin,
  type WorkerProfile,
  type InsertWorkerProfile,
  type Employment,
  type InsertEmployment,
  type EmploymentPrivateData,
  type InsertEmploymentPrivateData,
  type Country,
  type InsertCountry,
  type House,
  type InsertHouse,
  type Room,
  type InsertRoom,
  type Bed,
  type InsertBed,
  type Reservation,
  type InsertReservation,
  type QRCode,
  type InsertQRCode,
  type Assignment,
  type InsertAssignment,
  type Charge,
  type InsertCharge,
  type Payment,
  type InsertPayment,
  type AssignmentWithDetails,
  type ChargeWithWorker,
  type PaymentWithWorker,
  type AssignmentNote,
  type InsertAssignmentNote
} from "@shared/schema";
import { randomUUID } from "crypto";
import { 
  demoPlatformAdmins,
  demoTenants,
  demoTenantUsers,
  demoCountries
} from "./demo-data";
import {
  mockWorkerProfiles, 
  mockEmployments, 
  mockEmploymentPrivateData 
} from "../client/src/mocks/federated-data";

// Storage interface with federated worker identity support + multi-tenant platform
export interface IStorage {
  // Countries (Platform-level reference data)
  getAllCountries(): Promise<Country[]>;
  getCountryByIsoCode(isoCode: string): Promise<Country | undefined>;
  
  // Platform Admins
  getPlatformAdmin(id: string): Promise<PlatformAdmin | undefined>;
  getPlatformAdminByEmail(email: string): Promise<PlatformAdmin | undefined>;
  createPlatformAdmin(admin: InsertPlatformAdmin): Promise<PlatformAdmin>;
  
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  
  // Users (Tenant-level)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByEmail(email: string): Promise<User[]>; // Get all user records across all tenants for this email
  getUserByTenantEmail(tenantId: string, email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Worker Profiles (Global)
  getWorkerProfile(id: string): Promise<WorkerProfile | undefined>;
  getWorkerProfileByEmail(email: string): Promise<WorkerProfile | undefined>;
  createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile>;
  updateWorkerProfile(id: string, profile: Partial<InsertWorkerProfile>): Promise<WorkerProfile | undefined>;
  
  // Employments (Tenant-specific)
  getEmployment(id: string): Promise<Employment | undefined>;
  getEmploymentsByWorkerProfile(workerProfileId: string): Promise<Employment[]>;
  getEmploymentsByTenant(tenantId: string): Promise<Employment[]>;
  getActiveEmploymentsByTenant(tenantId: string): Promise<Employment[]>;
  createEmployment(employment: InsertEmployment): Promise<Employment>;
  updateEmployment(id: string, employment: Partial<InsertEmployment>): Promise<Employment | undefined>;
  
  // Employment Private Data (Sensitive)
  getEmploymentPrivateData(employmentId: string): Promise<EmploymentPrivateData | undefined>;
  createEmploymentPrivateData(data: InsertEmploymentPrivateData): Promise<EmploymentPrivateData>;
  updateEmploymentPrivateData(employmentId: string, data: Partial<InsertEmploymentPrivateData>): Promise<EmploymentPrivateData | undefined>;
  
  // Houses (Tenant-specific)
  getHouse(id: string): Promise<House | undefined>;
  getHousesByTenant(tenantId: string): Promise<House[]>;
  createHouse(house: InsertHouse): Promise<House>;
  updateHouse(id: string, house: Partial<InsertHouse>): Promise<House | undefined>;
  deleteHouse(id: string): Promise<boolean>;
  
  // Rooms (House-specific)
  getRoom(id: string): Promise<Room | undefined>;
  getRoomsByHouse(houseId: string): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;
  
  // Beds (Room-specific)
  getBed(id: string): Promise<Bed | undefined>;
  getBedsByRoom(roomId: string): Promise<Bed[]>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBed(id: string, bed: Partial<InsertBed>): Promise<Bed | undefined>;
  deleteBed(id: string): Promise<boolean>;
  
  // Reservations
  getReservation(id: string): Promise<Reservation | undefined>;
  getReservationsByBed(bedId: string): Promise<Reservation[]>;
  getActiveReservationsByTenant(tenantId: string): Promise<Reservation[]>;
  getActiveReservationForBed(bedId: string): Promise<Reservation | undefined>;
  getFutureReservationsForBed(bedId: string, afterDate: string): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: string, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  completeReservation(id: string, checkOutDate: string): Promise<Reservation | undefined>;
  
  // QR Codes (Task Delegation System)
  getQRCode(id: string): Promise<QRCode | undefined>;
  getQRCodeByCode(code: string): Promise<QRCode | undefined>;
  getQRCodesByTenant(tenantId: string): Promise<QRCode[]>;
  createQRCode(qrCode: InsertQRCode): Promise<QRCode>;
  updateQRCode(id: string, qrCode: Partial<InsertQRCode>): Promise<QRCode | undefined>;
  deleteQRCode(id: string): Promise<boolean>;
  incrementQRUsage(id: string): Promise<QRCode | undefined>;
  
  // Assignments (Accommodation management)
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentsByTenant(tenantId: string): Promise<AssignmentWithDetails[]>;
  getAssignmentsByEmployment(employmentId: string): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;
  
  // Charges (Monthly accommodation charges)
  getCharge(id: string): Promise<Charge | undefined>;
  getChargesByTenant(tenantId: string): Promise<ChargeWithWorker[]>;
  getChargesByAssignment(assignmentId: string): Promise<Charge[]>;
  createCharge(charge: InsertCharge): Promise<Charge>;
  updateCharge(id: string, charge: Partial<InsertCharge>): Promise<Charge | undefined>;
  deleteCharge(id: string): Promise<boolean>;
  
  // Payments (Payment records)
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByTenant(tenantId: string): Promise<PaymentWithWorker[]>;
  getPaymentsByCharge(chargeId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePayment(id: string): Promise<boolean>;
  
  // Assignment Notes (Conversation/activity notes)
  getAssignmentNotesByAssignment(assignmentId: string): Promise<AssignmentNote[]>;
  createAssignmentNote(note: InsertAssignmentNote): Promise<AssignmentNote>;
}

export class MemStorage implements IStorage {
  private countries: Map<string, Country>;
  private platformAdmins: Map<string, PlatformAdmin>;
  private tenants: Map<string, Tenant>;
  private users: Map<string, User>;
  private workerProfiles: Map<string, WorkerProfile>;
  private employments: Map<string, Employment>;
  private employmentPrivateData: Map<string, EmploymentPrivateData>;

  constructor() {
    this.countries = new Map();
    this.platformAdmins = new Map();
    this.tenants = new Map();
    this.users = new Map();
    this.workerProfiles = new Map();
    this.employments = new Map();
    this.employmentPrivateData = new Map();
    
    // Load mock data for development
    this.loadMockData();
  }
  
  private loadMockData() {
    // Load countries
    demoCountries.forEach(country => {
      this.countries.set(country.isoCode, country);
    });
    
    // Load platform admins
    demoPlatformAdmins.forEach(admin => {
      this.platformAdmins.set(admin.id, admin);
    });
    
    // Load tenants
    demoTenants.forEach(tenant => {
      this.tenants.set(tenant.id, tenant);
    });
    
    // Load tenant users
    demoTenantUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    
    // Load worker profiles
    mockWorkerProfiles.forEach(profile => {
      this.workerProfiles.set(profile.id, profile);
    });
    
    // Load employments
    mockEmployments.forEach(employment => {
      this.employments.set(employment.id, employment);
    });
    
    // Load employment private data
    mockEmploymentPrivateData.forEach(privateData => {
      this.employmentPrivateData.set(privateData.id, privateData);
    });
    
    console.log(`✅ Platform data: ${this.countries.size} countries, ${this.platformAdmins.size} admins, ${this.tenants.size} tenants, ${this.users.size} users`);
    console.log(`✅ Worker data: ${this.workerProfiles.size} profiles, ${this.employments.size} employments, ${this.employmentPrivateData.size} private data`);
  }

  // ============================================
  // Countries
  // ============================================

  async getAllCountries(): Promise<Country[]> {
    return Array.from(this.countries.values()).filter(c => c.isActive);
  }

  async getCountryByIsoCode(isoCode: string): Promise<Country | undefined> {
    return this.countries.get(isoCode);
  }

  // ============================================
  // Platform Admins
  // ============================================

  async getPlatformAdmin(id: string): Promise<PlatformAdmin | undefined> {
    return this.platformAdmins.get(id);
  }

  async getPlatformAdminByEmail(email: string): Promise<PlatformAdmin | undefined> {
    return Array.from(this.platformAdmins.values()).find(
      (admin) => admin.email === email
    );
  }

  async createPlatformAdmin(insertAdmin: InsertPlatformAdmin): Promise<PlatformAdmin> {
    const id = randomUUID();
    const admin: PlatformAdmin = {
      ...insertAdmin,
      role: insertAdmin.role ?? "admin",
      id,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.platformAdmins.set(id, admin);
    return admin;
  }

  // ============================================
  // Tenants
  // ============================================

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(
      (tenant) => tenant.slug === slug
    );
  }

  async getAllTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const tenant: Tenant = {
      ...insertTenant,
      type: insertTenant.type ?? "staffing_agency",
      status: insertTenant.status ?? "trial",
      plan: insertTenant.plan ?? "professional",
      currency: insertTenant.currency ?? "EUR",
      favoriteCountries: insertTenant.favoriteCountries ?? null,
      defaultCountry: insertTenant.defaultCountry ?? null,
      contactEmail: insertTenant.contactEmail ?? null,
      contactPhone: insertTenant.contactPhone ?? null,
      trialEndsAt: insertTenant.trialEndsAt ?? null,
      subscriptionStartsAt: insertTenant.subscriptionStartsAt ?? null,
      modules: insertTenant.modules ?? '{"workers":true,"planning":false,"accommodation":false,"transport":false,"finance":false}',
      createdBy: insertTenant.createdBy ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const existing = this.tenants.get(id);
    if (!existing) return undefined;

    const updated: Tenant = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.tenants.set(id, updated);
    return updated;
  }

  // ============================================
  // Users (Tenant-level)
  // ============================================

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUsersByEmail(email: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.email === email
    );
  }

  async getUserByTenantEmail(tenantId: string, email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.tenantId === tenantId && user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      password: insertUser.password ?? null,
      roles: insertUser.roles ?? ["viewer"],
      status: insertUser.status ?? "invited",
      invitedAt: insertUser.invitedAt ?? null,
      invitedBy: insertUser.invitedBy ?? null,
      activatedAt: insertUser.activatedAt ?? null,
      invitationToken: insertUser.invitationToken ?? null,
      lastLoginAt: null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // ============================================
  // Worker Profiles (Global)
  // ============================================

  async getWorkerProfile(id: string): Promise<WorkerProfile | undefined> {
    return this.workerProfiles.get(id);
  }

  async getWorkerProfileByEmail(email: string): Promise<WorkerProfile | undefined> {
    return Array.from(this.workerProfiles.values()).find(
      (profile) => profile.email === email,
    );
  }

  async createWorkerProfile(insertProfile: InsertWorkerProfile): Promise<WorkerProfile> {
    const id = randomUUID();
    const profile: WorkerProfile = {
      ...insertProfile,
      phone: insertProfile.phone ?? null,
      nationality: insertProfile.nationality ?? null,
      dateOfBirth: insertProfile.dateOfBirth ?? null,
      password: insertProfile.password ?? null,
      photo: insertProfile.photo ?? null,
      bio: insertProfile.bio ?? null,
      address: insertProfile.address ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workerProfiles.set(id, profile);
    return profile;
  }

  async updateWorkerProfile(id: string, updates: Partial<InsertWorkerProfile>): Promise<WorkerProfile | undefined> {
    const existing = this.workerProfiles.get(id);
    if (!existing) return undefined;

    const updated: WorkerProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.workerProfiles.set(id, updated);
    return updated;
  }

  // ============================================
  // Employments (Tenant-specific)
  // ============================================

  async getEmployment(id: string): Promise<Employment | undefined> {
    return this.employments.get(id);
  }

  async getEmploymentsByWorkerProfile(workerProfileId: string): Promise<Employment[]> {
    return Array.from(this.employments.values()).filter(
      (emp) => emp.workerProfileId === workerProfileId
    );
  }

  async getEmploymentsByTenant(tenantId: string): Promise<Employment[]> {
    return Array.from(this.employments.values()).filter(
      (emp) => emp.tenantId === tenantId
    );
  }

  async getActiveEmploymentsByTenant(tenantId: string): Promise<Employment[]> {
    return Array.from(this.employments.values()).filter(
      (emp) => emp.tenantId === tenantId && emp.status === "active"
    );
  }

  async createEmployment(insertEmployment: InsertEmployment): Promise<Employment> {
    const id = randomUUID();
    const employment: Employment = {
      ...insertEmployment,
      status: insertEmployment.status ?? null,
      endDate: insertEmployment.endDate ?? null,
      snapshotPhoto: insertEmployment.snapshotPhoto ?? null,
      jobTitle: insertEmployment.jobTitle ?? null,
      department: insertEmployment.department ?? null,
      createdBy: insertEmployment.createdBy ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employments.set(id, employment);
    return employment;
  }

  async updateEmployment(id: string, updates: Partial<InsertEmployment>): Promise<Employment | undefined> {
    const existing = this.employments.get(id);
    if (!existing) return undefined;

    const updated: Employment = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.employments.set(id, updated);
    return updated;
  }

  // ============================================
  // Employment Private Data (Sensitive)
  // ============================================

  async getEmploymentPrivateData(employmentId: string): Promise<EmploymentPrivateData | undefined> {
    return Array.from(this.employmentPrivateData.values()).find(
      (data) => data.employmentId === employmentId
    );
  }

  async createEmploymentPrivateData(insertData: InsertEmploymentPrivateData): Promise<EmploymentPrivateData> {
    const id = randomUUID();
    const data: EmploymentPrivateData = {
      ...insertData,
      salary: insertData.salary ?? null,
      salaryFrequency: insertData.salaryFrequency ?? null,
      currency: insertData.currency ?? null,
      contractType: insertData.contractType ?? null,
      contractStartDate: insertData.contractStartDate ?? null,
      contractEndDate: insertData.contractEndDate ?? null,
      internalNotes: insertData.internalNotes ?? null,
      performanceRating: insertData.performanceRating ?? null,
      managerId: insertData.managerId ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employmentPrivateData.set(id, data);
    return data;
  }

  async updateEmploymentPrivateData(employmentId: string, updates: Partial<InsertEmploymentPrivateData>): Promise<EmploymentPrivateData | undefined> {
    const existing = Array.from(this.employmentPrivateData.values()).find(
      (data) => data.employmentId === employmentId
    );
    if (!existing) return undefined;

    const updated: EmploymentPrivateData = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.employmentPrivateData.set(existing.id, updated);
    return updated;
  }

  // ============================================
  // Houses/Rooms/Beds (Not implemented for MemStorage)
  // ============================================
  async getHouse(_id: string): Promise<House | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getHousesByTenant(_tenantId: string): Promise<House[]> { throw new Error("Not implemented in MemStorage"); }
  async createHouse(_house: InsertHouse): Promise<House> { throw new Error("Not implemented in MemStorage"); }
  async updateHouse(_id: string, _house: Partial<InsertHouse>): Promise<House | undefined> { throw new Error("Not implemented in MemStorage"); }
  async deleteHouse(_id: string): Promise<boolean> { throw new Error("Not implemented in MemStorage"); }
  async getRoom(_id: string): Promise<Room | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getRoomsByHouse(_houseId: string): Promise<Room[]> { throw new Error("Not implemented in MemStorage"); }
  async createRoom(_room: InsertRoom): Promise<Room> { throw new Error("Not implemented in MemStorage"); }
  async updateRoom(_id: string, _room: Partial<InsertRoom>): Promise<Room | undefined> { throw new Error("Not implemented in MemStorage"); }
  async deleteRoom(_id: string): Promise<boolean> { throw new Error("Not implemented in MemStorage"); }
  async getBed(_id: string): Promise<Bed | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getBedsByRoom(_roomId: string): Promise<Bed[]> { throw new Error("Not implemented in MemStorage"); }
  async createBed(_bed: InsertBed): Promise<Bed> { throw new Error("Not implemented in MemStorage"); }
  async updateBed(_id: string, _bed: Partial<InsertBed>): Promise<Bed | undefined> { throw new Error("Not implemented in MemStorage"); }
  async deleteBed(_id: string): Promise<boolean> { throw new Error("Not implemented in MemStorage"); }
  
  // Reservations - Not implemented in MemStorage
  async getReservation(_id: string): Promise<Reservation | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getReservationsByBed(_bedId: string): Promise<Reservation[]> { throw new Error("Not implemented in MemStorage"); }
  async getActiveReservationsByTenant(_tenantId: string): Promise<Reservation[]> { throw new Error("Not implemented in MemStorage"); }
  async getActiveReservationForBed(_bedId: string): Promise<Reservation | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getFutureReservationsForBed(_bedId: string, _afterDate: string): Promise<Reservation[]> { throw new Error("Not implemented in MemStorage"); }
  async createReservation(_reservation: InsertReservation): Promise<Reservation> { throw new Error("Not implemented in MemStorage"); }
  async updateReservation(_id: string, _reservation: Partial<InsertReservation>): Promise<Reservation | undefined> { throw new Error("Not implemented in MemStorage"); }
  async completeReservation(_id: string, _checkOutDate: string): Promise<Reservation | undefined> { throw new Error("Not implemented in MemStorage"); }
  
  // QR Codes stubs
  async getQRCode(_id: string): Promise<QRCode | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getQRCodeByCode(_code: string): Promise<QRCode | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getQRCodesByTenant(_tenantId: string): Promise<QRCode[]> { throw new Error("Not implemented in MemStorage"); }
  async createQRCode(_qrCode: InsertQRCode): Promise<QRCode> { throw new Error("Not implemented in MemStorage"); }
  async updateQRCode(_id: string, _qrCode: Partial<InsertQRCode>): Promise<QRCode | undefined> { throw new Error("Not implemented in MemStorage"); }
  async deleteQRCode(_id: string): Promise<boolean> { throw new Error("Not implemented in MemStorage"); }
  async incrementQRUsage(_id: string): Promise<QRCode | undefined> { throw new Error("Not implemented in MemStorage"); }
}

// ============================================
// DbStorage - PostgreSQL Implementation
// ============================================

import { db } from "./db";
import { 
  countries as countriesTable,
  platformAdmins as platformAdminsTable,
  tenants as tenantsTable,
  users as usersTable,
  workerProfiles as workerProfilesTable,
  employments as employmentsTable,
  employmentPrivateData as employmentPrivateDataTable,
  houses as housesTable,
  rooms as roomsTable,
  beds as bedsTable,
  reservations as reservationsTable,
  qrCodes as qrCodesTable
} from "@shared/schema";
import { eq, and, isNull, sql, gt, asc } from "drizzle-orm";

export class DbStorage implements IStorage {
  private seeded = false;
  private seedPromise: Promise<void> | null = null;

  constructor() {
    // Auto-seed on initialization
    this.seedPromise = this.ensureSeeded();
  }

  // Auto-seed on first access
  private async ensureSeeded() {
    if (!this.seeded) {
      await this.seedMockData();
      this.seeded = true;
    }
  }

  private async seedMockData() {
    try {
      // Check if already seeded (check platform admins instead of worker profiles)
      const existingAdmins = await db.select().from(platformAdminsTable).limit(1);
      if (existingAdmins.length > 0) {
        console.log("📦 Database already has data, skipping seed");
        return;
      }

      console.log("🌱 Seeding database with platform and worker data...");

      // Insert countries
      await db.insert(countriesTable).values(demoCountries);

      // Insert platform admins
      await db.insert(platformAdminsTable).values(demoPlatformAdmins);
      
      // Insert tenants
      await db.insert(tenantsTable).values(demoTenants);
      
      // Insert tenant users
      await db.insert(usersTable).values(demoTenantUsers);

      // Insert worker profiles
      await db.insert(workerProfilesTable).values(mockWorkerProfiles);
      
      // Insert employments
      await db.insert(employmentsTable).values(mockEmployments);
      
      // Insert employment private data
      await db.insert(employmentPrivateDataTable).values(mockEmploymentPrivateData);

      console.log(`✅ Platform data seeded: ${demoCountries.length} countries, ${demoPlatformAdmins.length} admins, ${demoTenants.length} tenants, ${demoTenantUsers.length} users`);
      console.log(`✅ Worker data seeded: ${mockWorkerProfiles.length} profiles, ${mockEmployments.length} employments, ${mockEmploymentPrivateData.length} private data`);
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
  }

  // ============================================
  // Countries
  // ============================================

  async getAllCountries(): Promise<Country[]> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(countriesTable).where(eq(countriesTable.isActive, true));
    return result;
  }

  async getCountryByIsoCode(isoCode: string): Promise<Country | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(countriesTable).where(eq(countriesTable.isoCode, isoCode)).limit(1);
    return result[0];
  }

  // ============================================
  // Platform Admins
  // ============================================

  async getPlatformAdmin(id: string): Promise<PlatformAdmin | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(platformAdminsTable).where(eq(platformAdminsTable.id, id)).limit(1);
    return result[0];
  }

  async getPlatformAdminByEmail(email: string): Promise<PlatformAdmin | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(platformAdminsTable).where(eq(platformAdminsTable.email, email)).limit(1);
    return result[0];
  }

  async createPlatformAdmin(insertAdmin: InsertPlatformAdmin): Promise<PlatformAdmin> {
    const result = await db.insert(platformAdminsTable).values(insertAdmin).returning();
    return result[0];
  }

  // ============================================
  // Tenants
  // ============================================

  async getTenant(id: string): Promise<Tenant | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(tenantsTable).where(eq(tenantsTable.id, id)).limit(1);
    return result[0];
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, slug)).limit(1);
    return result[0];
  }

  async getAllTenants(): Promise<Tenant[]> {
    await this.seedPromise; // Ensure seeded before query
    return await db.select().from(tenantsTable);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const result = await db.insert(tenantsTable).values(insertTenant).returning();
    return result[0];
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const result = await db.update(tenantsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tenantsTable.id, id))
      .returning();
    return result[0];
  }

  // ============================================
  // Users (Tenant-level)
  // ============================================

  async getUser(id: string): Promise<User | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return result[0];
  }

  async getUsersByEmail(email: string): Promise<User[]> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return result;
  }

  async getUserByTenantEmail(tenantId: string, email: string): Promise<User | undefined> {
    await this.seedPromise; // Ensure seeded before query
    const result = await db.select().from(usersTable)
      .where(and(
        eq(usersTable.tenantId, tenantId),
        eq(usersTable.email, email)
      ))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(usersTable).values({
      ...insertUser,
      roles: insertUser.roles ?? ["viewer"],
      status: insertUser.status ?? "invited"
    }).returning();
    return result[0];
  }

  // ============================================
  // Worker Profiles (Global)
  // ============================================

  async getWorkerProfile(id: string): Promise<WorkerProfile | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(workerProfilesTable).where(eq(workerProfilesTable.id, id)).limit(1);
    return result[0];
  }

  async getWorkerProfileByEmail(email: string): Promise<WorkerProfile | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(workerProfilesTable).where(eq(workerProfilesTable.email, email)).limit(1);
    return result[0];
  }

  async createWorkerProfile(insertProfile: InsertWorkerProfile): Promise<WorkerProfile> {
    const result = await db.insert(workerProfilesTable).values(insertProfile).returning();
    return result[0];
  }

  async updateWorkerProfile(id: string, profile: Partial<InsertWorkerProfile>): Promise<WorkerProfile | undefined> {
    const result = await db.update(workerProfilesTable)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(workerProfilesTable.id, id))
      .returning();
    return result[0];
  }

  // ============================================
  // Employments (Tenant-specific)
  // ============================================

  async getEmployment(id: string): Promise<Employment | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(employmentsTable).where(eq(employmentsTable.id, id)).limit(1);
    return result[0];
  }

  async getEmploymentsByWorkerProfile(workerProfileId: string): Promise<Employment[]> {
    await this.ensureSeeded();
    return await db.select().from(employmentsTable)
      .where(eq(employmentsTable.workerProfileId, workerProfileId));
  }

  async getEmploymentsByTenant(tenantId: string): Promise<Employment[]> {
    await this.ensureSeeded();
    return await db.select().from(employmentsTable)
      .where(eq(employmentsTable.tenantId, tenantId));
  }

  async getActiveEmploymentsByTenant(tenantId: string): Promise<Employment[]> {
    await this.ensureSeeded();
    return await db.select().from(employmentsTable)
      .where(and(
        eq(employmentsTable.tenantId, tenantId),
        eq(employmentsTable.status, "active")
      ));
  }

  async createEmployment(insertEmployment: InsertEmployment): Promise<Employment> {
    const result = await db.insert(employmentsTable).values(insertEmployment).returning();
    return result[0];
  }

  async updateEmployment(id: string, employment: Partial<InsertEmployment>): Promise<Employment | undefined> {
    const result = await db.update(employmentsTable)
      .set({ ...employment, updatedAt: new Date() })
      .where(eq(employmentsTable.id, id))
      .returning();
    return result[0];
  }

  // ============================================
  // Employment Private Data (Sensitive)
  // ============================================

  async getEmploymentPrivateData(employmentId: string): Promise<EmploymentPrivateData | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(employmentPrivateDataTable)
      .where(eq(employmentPrivateDataTable.employmentId, employmentId))
      .limit(1);
    return result[0];
  }

  async createEmploymentPrivateData(data: InsertEmploymentPrivateData): Promise<EmploymentPrivateData> {
    const result = await db.insert(employmentPrivateDataTable).values(data).returning();
    return result[0];
  }

  async updateEmploymentPrivateData(employmentId: string, data: Partial<InsertEmploymentPrivateData>): Promise<EmploymentPrivateData | undefined> {
    const result = await db.update(employmentPrivateDataTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employmentPrivateDataTable.employmentId, employmentId))
      .returning();
    return result[0];
  }

  // ============================================
  // Houses (Tenant-specific)
  // ============================================

  async getHouse(id: string): Promise<House | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(housesTable).where(eq(housesTable.id, id)).limit(1);
    return result[0];
  }

  async getHousesByTenant(tenantId: string): Promise<House[]> {
    await this.ensureSeeded();
    return await db.select().from(housesTable).where(eq(housesTable.tenantId, tenantId));
  }

  async createHouse(house: InsertHouse): Promise<House> {
    const result = await db.insert(housesTable).values(house).returning();
    return result[0];
  }

  async updateHouse(id: string, house: Partial<InsertHouse>): Promise<House | undefined> {
    const result = await db.update(housesTable)
      .set({ ...house, updatedAt: new Date() })
      .where(eq(housesTable.id, id))
      .returning();
    return result[0];
  }

  async deleteHouse(id: string): Promise<boolean> {
    const result = await db.delete(housesTable).where(eq(housesTable.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // Rooms (House-specific)
  // ============================================

  async getRoom(id: string): Promise<Room | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(roomsTable).where(eq(roomsTable.id, id)).limit(1);
    return result[0];
  }

  async getRoomsByHouse(houseId: string): Promise<Room[]> {
    await this.ensureSeeded();
    return await db.select().from(roomsTable).where(eq(roomsTable.houseId, houseId));
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const result = await db.insert(roomsTable).values(room).returning();
    return result[0];
  }

  async updateRoom(id: string, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const result = await db.update(roomsTable)
      .set({ ...room, updatedAt: new Date() })
      .where(eq(roomsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await db.delete(roomsTable).where(eq(roomsTable.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // Beds (Room-specific)
  // ============================================

  async getBed(id: string): Promise<Bed | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(bedsTable).where(eq(bedsTable.id, id)).limit(1);
    return result[0];
  }

  async getBedsByRoom(roomId: string): Promise<Bed[]> {
    await this.ensureSeeded();
    return await db.select().from(bedsTable).where(eq(bedsTable.roomId, roomId));
  }

  async createBed(bed: InsertBed): Promise<Bed> {
    const result = await db.insert(bedsTable).values(bed).returning();
    return result[0];
  }

  async updateBed(id: string, bed: Partial<InsertBed>): Promise<Bed | undefined> {
    const result = await db.update(bedsTable)
      .set({ ...bed, updatedAt: new Date() })
      .where(eq(bedsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteBed(id: string): Promise<boolean> {
    const result = await db.delete(bedsTable).where(eq(bedsTable.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // Reservations
  // ============================================

  async getReservation(id: string): Promise<Reservation | undefined> {
    await this.ensureSeeded();
    const result = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id)).limit(1);
    return result[0];
  }

  async getReservationsByBed(bedId: string): Promise<Reservation[]> {
    await this.ensureSeeded();
    return await db.select().from(reservationsTable).where(eq(reservationsTable.bedId, bedId));
  }

  async getActiveReservationsByTenant(tenantId: string): Promise<Reservation[]> {
    await this.ensureSeeded();
    // Active = checked in (checkInDate not null) and not checked out (checkOutDate null)
    return await db.select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.tenantId, tenantId),
          isNull(reservationsTable.checkOutDate)
        )
      );
  }

  async getActiveReservationForBed(bedId: string): Promise<Reservation | undefined> {
    await this.ensureSeeded();
    // Active = checked in and not checked out
    const result = await db.select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.bedId, bedId),
          isNull(reservationsTable.checkOutDate)
        )
      )
      .limit(1);
    return result[0];
  }

  async getFutureReservationsForBed(bedId: string, afterDate: string): Promise<Reservation[]> {
    await this.ensureSeeded();
    // Get reservations that start after the given date and haven't been checked out
    return await db.select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.bedId, bedId),
          gt(reservationsTable.checkInDate, afterDate),
          isNull(reservationsTable.checkOutDate)
        )
      )
      .orderBy(asc(reservationsTable.checkInDate));
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const result = await db.insert(reservationsTable).values(reservation).returning();
    return result[0];
  }

  async updateReservation(id: string, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const result = await db.update(reservationsTable)
      .set({ ...reservation, updatedAt: new Date() })
      .where(eq(reservationsTable.id, id))
      .returning();
    return result[0];
  }

  async completeReservation(id: string, checkOutDate: string): Promise<Reservation | undefined> {
    const result = await db.update(reservationsTable)
      .set({ 
        checkOutDate,
        status: "checked_out",
        updatedAt: new Date() 
      })
      .where(eq(reservationsTable.id, id))
      .returning();
    return result[0];
  }

  // ============================================
  // QR Codes Implementation
  // ============================================

  async getQRCode(id: string): Promise<QRCode | undefined> {
    const result = await db.select().from(qrCodesTable).where(eq(qrCodesTable.id, id)).limit(1);
    return result[0];
  }

  async getQRCodeByCode(code: string): Promise<QRCode | undefined> {
    const result = await db.select().from(qrCodesTable).where(eq(qrCodesTable.code, code)).limit(1);
    return result[0];
  }

  async getQRCodesByTenant(tenantId: string): Promise<QRCode[]> {
    return db.select().from(qrCodesTable).where(eq(qrCodesTable.tenantId, tenantId));
  }

  async createQRCode(qrCode: InsertQRCode): Promise<QRCode> {
    const result = await db.insert(qrCodesTable).values(qrCode).returning();
    return result[0];
  }

  async updateQRCode(id: string, qrCode: Partial<InsertQRCode>): Promise<QRCode | undefined> {
    const result = await db.update(qrCodesTable)
      .set(qrCode)
      .where(eq(qrCodesTable.id, id))
      .returning();
    return result[0];
  }

  async deleteQRCode(id: string): Promise<boolean> {
    const result = await db.delete(qrCodesTable).where(eq(qrCodesTable.id, id)).returning();
    return result.length > 0;
  }

  async incrementQRUsage(id: string): Promise<QRCode | undefined> {
    const result = await db.update(qrCodesTable)
      .set({ usedCount: sql`${qrCodesTable.usedCount} + 1` })
      .where(eq(qrCodesTable.id, id))
      .returning();
    return result[0];
  }

  // ============================================
  // Assignments Implementation
  // ============================================
  
  async getAssignment(id: string): Promise<Assignment | undefined> {
    await this.ensureSeeded();
    const { assignments: assignmentsTable } = await import("@shared/schema");
    const result = await db.select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.id, id))
      .limit(1);
    return result[0];
  }

  async getAssignmentsByTenant(tenantId: string): Promise<AssignmentWithDetails[]> {
    await this.ensureSeeded();
    const { 
      assignments: assignmentsTable,
      employments: employmentsTable,
      workerProfiles: workerProfilesTable,
      houses: housesTable,
      rooms: roomsTable,
      beds: bedsTable
    } = await import("@shared/schema");
    
    // Fetch assignments with JOINs for computed fields
    const results = await db.select({
      assignment: assignmentsTable,
      employment: employmentsTable,
      workerProfile: workerProfilesTable,
      house: housesTable,
      room: roomsTable,
      bed: bedsTable,
    })
      .from(assignmentsTable)
      .leftJoin(employmentsTable, eq(assignmentsTable.employmentId, employmentsTable.id))
      .leftJoin(workerProfilesTable, eq(employmentsTable.workerProfileId, workerProfilesTable.id))
      .leftJoin(housesTable, eq(assignmentsTable.houseId, housesTable.id))
      .leftJoin(roomsTable, eq(assignmentsTable.roomId, roomsTable.id))
      .leftJoin(bedsTable, eq(assignmentsTable.bedId, bedsTable.id))
      .where(eq(assignmentsTable.tenantId, tenantId))
      .orderBy(desc(assignmentsTable.startDate));
    
    // Map to AssignmentWithDetails
    return results.map(r => ({
      ...r.assignment,
      workerName: r.workerProfile ? `${r.workerProfile.firstName} ${r.workerProfile.lastName}` : 'Unknown',
      houseName: r.house?.address || 'Unknown',
      roomNumber: r.room?.roomNumber || 'Unknown',
      bedNumber: r.bed?.bedNumber || 0,
    }));
  }

  async getAssignmentsByEmployment(employmentId: string): Promise<Assignment[]> {
    await this.ensureSeeded();
    const { assignments: assignmentsTable } = await import("@shared/schema");
    return db.select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.employmentId, employmentId))
      .orderBy(desc(assignmentsTable.startDate));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const { assignments: assignmentsTable } = await import("@shared/schema");
    const result = await db.insert(assignmentsTable).values(assignment).returning();
    return result[0];
  }

  async updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const { assignments: assignmentsTable } = await import("@shared/schema");
    const result = await db.update(assignmentsTable)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(assignmentsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const { assignments: assignmentsTable } = await import("@shared/schema");
    const result = await db.delete(assignmentsTable)
      .where(eq(assignmentsTable.id, id))
      .returning();
    return result.length > 0;
  }

  // ============================================
  // Charges Implementation
  // ============================================
  
  async getCharge(id: string): Promise<Charge | undefined> {
    await this.ensureSeeded();
    const { charges: chargesTable } = await import("@shared/schema");
    const result = await db.select()
      .from(chargesTable)
      .where(eq(chargesTable.id, id))
      .limit(1);
    return result[0];
  }

  async getChargesByTenant(tenantId: string): Promise<ChargeWithWorker[]> {
    await this.ensureSeeded();
    const { 
      charges: chargesTable,
      assignments: assignmentsTable,
      employments: employmentsTable,
      workerProfiles: workerProfilesTable
    } = await import("@shared/schema");
    
    // Fetch charges with JOINs to get worker name
    const results = await db.select({
      charge: chargesTable,
      assignment: assignmentsTable,
      employment: employmentsTable,
      workerProfile: workerProfilesTable,
    })
      .from(chargesTable)
      .leftJoin(assignmentsTable, eq(chargesTable.assignmentId, assignmentsTable.id))
      .leftJoin(employmentsTable, eq(assignmentsTable.employmentId, employmentsTable.id))
      .leftJoin(workerProfilesTable, eq(employmentsTable.workerProfileId, workerProfilesTable.id))
      .where(eq(chargesTable.tenantId, tenantId))
      .orderBy(desc(chargesTable.dueDate));
    
    // Map to ChargeWithWorker
    return results.map(r => ({
      ...r.charge,
      workerName: r.workerProfile ? `${r.workerProfile.firstName} ${r.workerProfile.lastName}` : 'Unknown',
    }));
  }

  async getChargesByAssignment(assignmentId: string): Promise<Charge[]> {
    await this.ensureSeeded();
    const { charges: chargesTable } = await import("@shared/schema");
    return db.select()
      .from(chargesTable)
      .where(eq(chargesTable.assignmentId, assignmentId))
      .orderBy(desc(chargesTable.dueDate));
  }

  async createCharge(charge: InsertCharge): Promise<Charge> {
    const { charges: chargesTable } = await import("@shared/schema");
    const result = await db.insert(chargesTable).values(charge).returning();
    return result[0];
  }

  async updateCharge(id: string, charge: Partial<InsertCharge>): Promise<Charge | undefined> {
    const { charges: chargesTable } = await import("@shared/schema");
    const result = await db.update(chargesTable)
      .set({ ...charge, updatedAt: new Date() })
      .where(eq(chargesTable.id, id))
      .returning();
    return result[0];
  }

  async deleteCharge(id: string): Promise<boolean> {
    const { charges: chargesTable } = await import("@shared/schema");
    const result = await db.delete(chargesTable)
      .where(eq(chargesTable.id, id))
      .returning();
    return result.length > 0;
  }

  // ============================================
  // Payments Implementation
  // ============================================
  
  async getPayment(id: string): Promise<Payment | undefined> {
    await this.ensureSeeded();
    const { payments: paymentsTable } = await import("@shared/schema");
    const result = await db.select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, id))
      .limit(1);
    return result[0];
  }

  async getPaymentsByTenant(tenantId: string): Promise<PaymentWithWorker[]> {
    await this.ensureSeeded();
    const { 
      payments: paymentsTable,
      charges: chargesTable,
      assignments: assignmentsTable,
      employments: employmentsTable,
      workerProfiles: workerProfilesTable
    } = await import("@shared/schema");
    
    // Fetch payments with JOINs to get worker name
    const results = await db.select({
      payment: paymentsTable,
      charge: chargesTable,
      assignment: assignmentsTable,
      employment: employmentsTable,
      workerProfile: workerProfilesTable,
    })
      .from(paymentsTable)
      .leftJoin(chargesTable, eq(paymentsTable.chargeId, chargesTable.id))
      .leftJoin(assignmentsTable, eq(chargesTable.assignmentId, assignmentsTable.id))
      .leftJoin(employmentsTable, eq(assignmentsTable.employmentId, employmentsTable.id))
      .leftJoin(workerProfilesTable, eq(employmentsTable.workerProfileId, workerProfilesTable.id))
      .where(eq(paymentsTable.tenantId, tenantId))
      .orderBy(desc(paymentsTable.paymentDate));
    
    // Map to PaymentWithWorker
    return results.map(r => ({
      ...r.payment,
      workerName: r.workerProfile ? `${r.workerProfile.firstName} ${r.workerProfile.lastName}` : 'Unknown',
    }));
  }

  async getPaymentsByCharge(chargeId: string): Promise<Payment[]> {
    await this.ensureSeeded();
    const { payments: paymentsTable } = await import("@shared/schema");
    return db.select()
      .from(paymentsTable)
      .where(eq(paymentsTable.chargeId, chargeId))
      .orderBy(desc(paymentsTable.paymentDate));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const { payments: paymentsTable } = await import("@shared/schema");
    const result = await db.insert(paymentsTable).values(payment).returning();
    return result[0];
  }

  async deletePayment(id: string): Promise<boolean> {
    const { payments: paymentsTable } = await import("@shared/schema");
    const result = await db.delete(paymentsTable)
      .where(eq(paymentsTable.id, id))
      .returning();
    return result.length > 0;
  }

  // ============================================
  // Assignment Notes
  // ============================================

  async getAssignmentNotesByAssignment(assignmentId: string): Promise<AssignmentNote[]> {
    await this.ensureSeeded();
    const { assignmentNotes: assignmentNotesTable } = await import("@shared/schema");
    return db.select()
      .from(assignmentNotesTable)
      .where(eq(assignmentNotesTable.assignmentId, assignmentId))
      .orderBy(desc(assignmentNotesTable.createdAt));
  }

  async createAssignmentNote(note: InsertAssignmentNote): Promise<AssignmentNote> {
    const { assignmentNotes: assignmentNotesTable } = await import("@shared/schema");
    const result = await db.insert(assignmentNotesTable).values(note).returning();
    return result[0];
  }
}

// ============================================
// Storage Selection
// ============================================

// Use DbStorage for persistent PostgreSQL storage
export const storage = new DbStorage();

console.log(`💾 Storage mode: PostgreSQL (DbStorage)`);

