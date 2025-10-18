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
  type InsertEmploymentPrivateData
} from "@shared/schema";
import { randomUUID } from "crypto";
import { 
  demoPlatformAdmins,
  demoTenants,
  demoTenantUsers
} from "./demo-data";
import {
  mockWorkerProfiles, 
  mockEmployments, 
  mockEmploymentPrivateData 
} from "../client/src/mocks/federated-data";

// Storage interface with federated worker identity support + multi-tenant platform
export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private platformAdmins: Map<string, PlatformAdmin>;
  private tenants: Map<string, Tenant>;
  private users: Map<string, User>;
  private workerProfiles: Map<string, WorkerProfile>;
  private employments: Map<string, Employment>;
  private employmentPrivateData: Map<string, EmploymentPrivateData>;

  constructor() {
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
    
    console.log(`✅ Platform data: ${this.platformAdmins.size} admins, ${this.tenants.size} tenants, ${this.users.size} users`);
    console.log(`✅ Worker data: ${this.workerProfiles.size} profiles, ${this.employments.size} employments, ${this.employmentPrivateData.size} private data`);
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
}

// ============================================
// DbStorage - PostgreSQL Implementation
// ============================================

import { db } from "./db";
import { 
  platformAdmins as platformAdminsTable,
  tenants as tenantsTable,
  users as usersTable,
  workerProfiles as workerProfilesTable,
  employments as employmentsTable,
  employmentPrivateData as employmentPrivateDataTable
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

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

      console.log(`✅ Platform data seeded: ${demoPlatformAdmins.length} admins, ${demoTenants.length} tenants, ${demoTenantUsers.length} users`);
      console.log(`✅ Worker data seeded: ${mockWorkerProfiles.length} profiles, ${mockEmployments.length} employments, ${mockEmploymentPrivateData.length} private data`);
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
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
}

// ============================================
// Hybrid Storage Selection
// ============================================

// Use DbStorage in production, MemStorage in development
export const storage = process.env.NODE_ENV === 'production'
  ? new DbStorage()
  : new MemStorage();

console.log(`💾 Storage mode: ${process.env.NODE_ENV === 'production' ? 'PostgreSQL (DbStorage)' : 'In-Memory (MemStorage)'}`);

