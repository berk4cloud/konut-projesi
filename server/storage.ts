import { 
  type User, 
  type InsertUser,
  type WorkerProfile,
  type InsertWorkerProfile,
  type Employment,
  type InsertEmployment,
  type EmploymentPrivateData,
  type InsertEmploymentPrivateData
} from "@shared/schema";
import { randomUUID } from "crypto";
import { 
  mockWorkerProfiles, 
  mockEmployments, 
  mockEmploymentPrivateData 
} from "../client/src/mocks/federated-data";

// Storage interface with federated worker identity support
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  private users: Map<string, User>;
  private workerProfiles: Map<string, WorkerProfile>;
  private employments: Map<string, Employment>;
  private employmentPrivateData: Map<string, EmploymentPrivateData>;

  constructor() {
    this.users = new Map();
    this.workerProfiles = new Map();
    this.employments = new Map();
    this.employmentPrivateData = new Map();
    
    // Load mock data for development
    this.loadMockData();
  }
  
  private loadMockData() {
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
    
    console.log(`✅ Mock data loaded: ${this.workerProfiles.size} profiles, ${this.employments.size} employments, ${this.employmentPrivateData.size} private data`);
  }

  // ============================================
  // Users
  // ============================================

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role ?? "office_staff",
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
  users as usersTable,
  workerProfiles as workerProfilesTable,
  employments as employmentsTable,
  employmentPrivateData as employmentPrivateDataTable
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class DbStorage implements IStorage {
  private seeded = false;

  // Auto-seed on first access
  private async ensureSeeded() {
    if (!this.seeded) {
      await this.seedMockData();
      this.seeded = true;
    }
  }

  private async seedMockData() {
    try {
      // Check if already seeded
      const existingProfiles = await db.select().from(workerProfilesTable).limit(1);
      if (existingProfiles.length > 0) {
        console.log("📦 Database already has data, skipping seed");
        return;
      }

      console.log("🌱 Seeding database with mock data...");

      // Insert worker profiles
      await db.insert(workerProfilesTable).values(mockWorkerProfiles);
      
      // Insert employments
      await db.insert(employmentsTable).values(mockEmployments);
      
      // Insert employment private data
      await db.insert(employmentPrivateDataTable).values(mockEmploymentPrivateData);

      console.log(`✅ Database seeded: ${mockWorkerProfiles.length} profiles, ${mockEmployments.length} employments, ${mockEmploymentPrivateData.length} private data`);
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
  }

  // ============================================
  // Users
  // ============================================

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(usersTable).values({
      ...insertUser,
      role: insertUser.role ?? "office_staff"
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

