/**
 * Employment Adapter - Compatibility Layer
 * 
 * This adapter converts federated worker model data to legacy worker format
 * so existing UI components can continue working while we gradually migrate.
 */

import type { WorkerProfile, Employment, EmploymentPrivateData } from "@shared/schema";
import { mockWorkerProfiles, mockEmployments, mockEmploymentPrivateData } from "@/mocks/federated-data";

// Legacy worker format that UI expects
export interface LegacyWorker {
  id: string; // DEPRECATED: Use employmentId instead. This field contains employmentId (not worker profile id)
  employmentId: string; // Federated model - unique employment ID
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  jobTitle?: string;
  status: "active" | "inactive" | "former" | "invited";
}

/**
 * Convert Employment + Worker Profile to Legacy Worker format
 * Key: The "id" field is the EMPLOYMENT ID, not worker profile ID
 * This is critical for reservations/beds which reference employmentId
 */
export function employmentToLegacyWorker(
  employment: Employment,
  profile: WorkerProfile
): LegacyWorker {
  return {
    id: employment.id, // DEPRECATED: Backward compatibility (same as employmentId)
    employmentId: employment.id, // Federated model - unique employment ID
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    email: profile.email,
    phone: profile.phone || undefined,
    dateOfBirth: profile.dateOfBirth || undefined,
    nationality: profile.nationality || undefined,
    jobTitle: employment.jobTitle || undefined,
    status: employment.status || "active", // Default to active if null
  };
}

/**
 * Get all active workers for a tenant (in legacy format)
 */
export function getActiveWorkersForTenant(tenantId: string): LegacyWorker[] {
  const activeEmployments = mockEmployments.filter(
    emp => emp.tenantId === tenantId && emp.status === "active"
  );
  
  return activeEmployments.map(employment => {
    const profile = mockWorkerProfiles.find(p => p.id === employment.workerProfileId);
    if (!profile) {
      console.error(`Profile not found for employment ${employment.id}`);
      return null;
    }
    return employmentToLegacyWorker(employment, profile);
  }).filter((w): w is LegacyWorker => w !== null);
}

/**
 * Get all workers for a tenant (in legacy format) - includes former employees
 */
export function getAllWorkersForTenant(tenantId: string): LegacyWorker[] {
  const allEmployments = mockEmployments.filter(
    emp => emp.tenantId === tenantId
  );
  
  return allEmployments.map(employment => {
    const profile = mockWorkerProfiles.find(p => p.id === employment.workerProfileId);
    if (!profile) {
      console.error(`Profile not found for employment ${employment.id}`);
      return null;
    }
    return employmentToLegacyWorker(employment, profile);
  }).filter((w): w is LegacyWorker => w !== null);
}

/**
 * Get worker by employment ID (for display in bed cards, assignments, etc.)
 */
export function getWorkerByEmploymentId(employmentId: string): LegacyWorker | null {
  const employment = mockEmployments.find(emp => emp.id === employmentId);
  if (!employment) return null;
  
  const profile = mockWorkerProfiles.find(p => p.id === employment.workerProfileId);
  if (!profile) return null;
  
  return employmentToLegacyWorker(employment, profile);
}

/**
 * Get worker profile by employment ID (for detailed views)
 */
export function getProfileByEmploymentId(employmentId: string): WorkerProfile | null {
  const employment = mockEmployments.find(emp => emp.id === employmentId);
  if (!employment) return null;
  
  return mockWorkerProfiles.find(p => p.id === employment.workerProfileId) || null;
}

/**
 * Get employment details (full federated data)
 */
export function getEmploymentDetails(employmentId: string) {
  const employment = mockEmployments.find(emp => emp.id === employmentId);
  if (!employment) return null;
  
  const profile = mockWorkerProfiles.find(p => p.id === employment.workerProfileId);
  const privateData = mockEmploymentPrivateData.find(pd => pd.employmentId === employmentId);
  
  return {
    employment,
    profile,
    privateData,
    legacy: profile ? employmentToLegacyWorker(employment, profile) : null
  };
}

/**
 * Create a new worker (creates both profile and employment)
 * Returns the employment ID (which is the "worker id" in legacy format)
 */
export interface CreateWorkerInput {
  email: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  tenantId: string;
  startDate: string;
}

export function createWorker(input: CreateWorkerInput): { employmentId: string; legacyWorker: LegacyWorker } {
  // In real app, this would call API
  // For now, just mock it
  
  const profileId = `wp-${Date.now()}`;
  const employmentId = `emp-${Date.now()}`;
  
  const profile: WorkerProfile = {
    id: profileId,
    email: input.email,
    password: null,
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    phone: input.phone || null,
    nationality: input.nationality || null,
    dateOfBirth: input.dateOfBirth || null,
    photo: null,
    bio: null,
    address: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const employment: Employment = {
    id: employmentId,
    workerProfileId: profileId,
    tenantId: input.tenantId,
    status: "active",
    startDate: input.startDate,
    endDate: null,
    snapshotGender: input.gender,
    snapshotPhoto: null,
    snapshotFirstName: input.firstName,
    snapshotLastName: input.lastName,
    jobTitle: input.jobTitle || null,
    department: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
  };
  
  // Add to mock data
  mockWorkerProfiles.push(profile);
  mockEmployments.push(employment);
  
  return {
    employmentId,
    legacyWorker: employmentToLegacyWorker(employment, profile)
  };
}
