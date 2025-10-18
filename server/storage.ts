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

export const storage = new MemStorage();
